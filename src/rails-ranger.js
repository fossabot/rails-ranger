import Axios               from 'axios'
import { clone }           from 'lodash'
import PathBuilder         from './path-builder'
import RouteBuilder        from './rails-route-builder'
import DataTransformations from './utils/data-transformations'

class RailsRanger {
  /**
  * RailsRanger object constructor
  * @constructor
  * @param {object} options - Configurations of the new RailsRanger instance
  * @param {boolean} options.transformData - Sets the response/request data transformations on/off
  * @param {object} options.axios - Configurations to be be handed down to Axios
  */
  constructor ({ transformData = true, axios = {} } = {}) {
    this.options = {
      transformData
    }

    const clientConfigs = {}

    if (this.options.transformData) {
      const dataTransformations = {
        transformRequest:  [DataTransformations.prepareRequest],
        transformResponse: [DataTransformations.prepareResponse]
      }
      Object.assign(clientConfigs, dataTransformations)
    }

    Object.assign(clientConfigs, axios)

    this.client       = Axios.create(clientConfigs)
    this.routeBuilder = new RouteBuilder()
    this.pathBuilder  = new PathBuilder()
  }

  /**
  * Defines a namespace to be used in the next request of the chain
  * @param {string} resource - the name of the resource to be used as namespace
  * @param {integer} id - the ID of the resource, can be left empty
  * @example
  * const api = new RailsRanger
  * api.resource('users', 1).list('blogPosts')
  * //=> GET request to '/users/1/blog_posts' path
  */
  resource (resource, id = null) {
    const newRouteBuilder = this.routeBuilder.resource(resource, id)

    return this._newInstanceWithNewRouteBuilder(newRouteBuilder)
  }

  /**
  * Defines a namespace to be used in the next request of the chain
  * @param {string} namespace - The path fragment to be used as the namespace
  * @param {object} params - The parameters to be interpolated into the path, can be left empty
  * @example
  * const api = new RailsRanger
  * api.namespace('admin/:type', { type: 'super' }).list('blogPosts')
  * //=> GET request to '/admin/super/blog_posts' path
  */
  namespace (namespace, params = {}) {
    const newRouteBuilder = this.routeBuilder.namespace(namespace, params)

    return this._newInstanceWithNewRouteBuilder(newRouteBuilder)
  }

  /**
  * Makes a GET request to the given path with the given parameters
  * @param {string} path - The base path of the request
  * @param {object} params - The parameters to be injected in the path (as query or replacing path segments)
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.get('/users/:id', { id: 1, flag: true })
  * //=> GET request to '/users/1?flag=true' path
  */
  get (path, params) {
    return this._rawRequest({ method: 'get', path, params })
  }

  /**
  * Makes a POST request to the given path with the given parameters
  * @param {string} path - The base path of the request
  * @param {object} params - The parameters to be injected in the path or sent in the request payload
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.post('/users/:id', { id: 1, flag: true })
  * //=> POST request to '/users/1' path with { flag: true } parameters
  */
  post (path, params) {
    return this._rawRequest({ method: 'post', path, params })
  }

  /**
  * Makes a PATCH request to the given path with the given parameters
  * @param {string} path - The base path of the request
  * @param {object} params - The parameters to be injected in the path or sent in the request payload
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.patch('/users/:id', { id: 1, flag: true })
  * //=> PATCH request to '/users/1' path with { flag: true } parameters
  */
  patch (path, params) {
    return this._rawRequest({ method: 'patch', path, params })
  }

  /**
  * Makes a PUT request to the given path with the given parameters
  * @param {string} path - The base path of the request
  * @param {object} params - The parameters to be injected in the path or sent in the request payload
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.put('/users/:id', { id: 1, flag: true })
  * //=> PUT request to '/users/1' path with { flag: true } parameters
  */
  put (path, params) {
    return this._rawRequest({ method: 'put', path, params })
  }

  /**
  * Makes a DELETE request to the given path with the given parameters
  * @param {string} path - The base path of the request
  * @param {object} params - The parameters to be injected in the path (as query or replacing path segments)
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.delete('/users/:id', { id: 1, flag: true })
  * //=> DELETE request to '/users/1?flag=true' path
  */
  delete (path, params) {
    return this._rawRequest({ method: 'delete', path, params })
  }

  /**
  * Makes a GET request to the **index path** of the given resource
  * @param {string} resource - The base path of the request
  * @param {object} params - The parameters to be injected in the path as query
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.list('users', { flag: true })
  * //=> GET request to '/users?flag=true' path
  */
  list (resource, params) {
    return this._actionRequest({ action: 'index', resource, params })
  }

  /**
  * Makes a GET request to the **show path** of the given resource
  * @param {string} resource - The base path of the request
  * @param {object} params - The parameters to be injected in the path as query
  * @param {number|string} params.id - The id of the resource
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.show('users', { id: 1, flag: true })
  * //=> GET request to '/users/1?flag=true' path
  */
  show (resource, params) {
    return this._actionRequest({ action: 'show', resource, params })
  }

  /**
  * Makes a DELETE request to the **destroy path** of the given resource
  * @param {string} resource - The base path of the request
  * @param {object} params - The parameters to be injected in the path as query
  * @param {number|string} params.id - The id of the resource
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.destroy('users', { id: 1, flag: true })
  * //=> DELETE request to '/users/1?flag=true' path
  */
  destroy (resource, params) {
    return this._actionRequest({ action: 'destroy', resource, params })
  }

  /**
  * Makes a POST request to the **create path** of the given resource
  * @param {string} resource - The base path of the request
  * @param {object} params - The parameters to be injected in the path as query
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.create('users', { email: 'john@doe.com', password: 123456 })
  * //=> POST request to '/users' path with the { email: 'john@doe.com', password: 123456 } parameters
  */
  create (resource, params) {
    return this._actionRequest({ action: 'create', resource, params })
  }

  /**
  * Makes a PATCH request to the update path of the given resource
  * @param {string} resource - The base path of the request
  * @param {object} params - The parameters to be injected in the path as query
  * @param {number|string} params.id - The id of the resource
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.update('users', { id: 1, email: 'elton@doe.com' })
  * //=> PATCH request to '/users/1' path with the { email: 'elton@doe.com' } parameters
  */
  update (resource, params) {
    return this._actionRequest({ action: 'update', resource, params })
  }

  /**
  * Makes a GET request to the new path of the given resource
  * @param {string} resource - The base path of the request
  * @param {object} params - The parameters to be injected in the path as query
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.new('users', { flag: true })
  * //=> GET request to '/users/new?flag=true' path
  */
  new (resource, params) {
    return this._actionRequest({ action: 'new', resource, params })
  }

  /**
  * Makes a GET request to the edit path of the given resource
  * @param {string} resource - The base path of the request
  * @param {object} params - The parameters to be injected in the path as query
  * @param {number|string} params.id - The id of the resource
  * @returns {Promise}
  * @example
  * const api = new RailsRanger
  * api.edit('users', { id: 1, flag: true })
  * //=> GET request to '/users/1/edit?flag=true' path
  */
  edit (resource, params) {
    return this._actionRequest({ action: 'edit', resource, params })
  }

  /**
   * Private functions
   */
  _rawRequest ({ method, path, params }) {
    const request = this.pathBuilder[method](path, params)

    return this.client[method](request.path, request.params)
  }

  _actionRequest ({ action, resource, params }) {
    const request = this.routeBuilder[action](resource, params)

    return this.client[request.method](request.path, request.params)
  }

  _newInstanceWithNewRouteBuilder (newRouteBuilder) {
    const newInstance        = clone(this)
    newInstance.routeBuilder = newRouteBuilder
    return newInstance
  }
}

export default RailsRanger
