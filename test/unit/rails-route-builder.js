import RailsRouteBuilder from '../../src/rails-route-builder'
import { MissingRequiredParameterError } from '../../src/exceptions'

describe('RailsRouteBuilder', () => {
  let routeBuilder = null

  beforeEach(() => {
    routeBuilder = new RailsRouteBuilder()
  })

  describe('.list', () => {
    it('returns the right path', () => {
      let request = routeBuilder.list('users', { flag: true })
      expect(request.path).to.eq('users?flag=true')
    })

    it('returns the right method', () => {
      let request = routeBuilder.list('users', { flag: true })
      expect(request.method).to.eq('get')
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.list('userPosts')
      expect(request.path).to.eq('user_posts')
    })
  })

  describe('.index', () => {
    it('returns the right path', () => {
      let request = routeBuilder.index('users', { flag: true })
      expect(request.path).to.eq('users?flag=true')
    })

    it('returns the right method', () => {
      let request = routeBuilder.index('users', { flag: true })
      expect(request.method).to.eq('get')
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.index('userPosts')
      expect(request.path).to.eq('user_posts')
    })
  })

  describe('.show', () => {
    it('returns the right path', () => {
      let request = routeBuilder.show('users', { id: 1, flag: true })
      expect(request.path).to.eq('users/1?flag=true')
    })

    it('returns the right method', () => {
      let request = routeBuilder.show('users', { id: 1, flag: true })
      expect(request.method).to.eq('get')
    })

    it ('throws an exception when no id is provided', () => {
      let route = () => { routeBuilder.show('users', { flag: true }) }
      expect(route).to.throw(Error)
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.show('userPosts', { id: 1 })
      expect(request.path).to.eq('user_posts/1')
    })
  })

  describe('.create', () => {
    it('returns the right path', () => {
      let request = routeBuilder.create('users', { flag: true })
      expect(request.path).to.eq('users')
    })

    it('returns the right parameters', () => {
      let request = routeBuilder.create('users', { flag: true })
      expect(request.params).to.deep.eq({ flag: true })
    })

    it('returns the right method', () => {
      let request = routeBuilder.create('users', { flag: true })
      expect(request.method).to.eq('post')
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.create('userPosts')
      expect(request.path).to.eq('user_posts')
    })
  })

  describe('.update', () => {
    it('returns the right path', () => {
      let request = routeBuilder.update('users', { id: 1, flag: true })
      expect(request.path).to.eq('users/1')
    })

    it('returns the right parameters', () => {
      let request = routeBuilder.update('users', { id: 1, flag: true })
      expect(request.params).to.deep.eq({ flag: true })
    })

    it('returns the right method', () => {
      let request = routeBuilder.update('users', { id: 1, flag: true })
      expect(request.method).to.eq('patch')
    })

    it ('throws an exception when no id is provided', () => {
      let route = () => { routeBuilder.update('users', { flag: true }) }
      expect(route).to.throw(Error)
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.update('userPosts', { id: 1 })
      expect(request.path).to.eq('user_posts/1')
    })
  })

  describe('.destroy', () => {
    it('returns the right path', () => {
      let request = routeBuilder.destroy('users', { id: 1, flag: true })
      expect(request.path).to.eq('users/1?flag=true')
    })

    it('returns the right method', () => {
      let request = routeBuilder.destroy('users', { id: 1, flag: true })
      expect(request.method).to.eq('delete')
    })

    it ('throws an exception when no id is provided', () => {
      let route = () => { routeBuilder.destroy('users', { flag: true }) }
      expect(route).to.throw(Error)
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.destroy('userPosts', { id: 1 })
      expect(request.path).to.eq('user_posts/1')
    })
  })

  describe('.new', () => {
    it('returns the right path', () => {
      let request = routeBuilder.new('users', { flag: true })
      expect(request.path).to.eq('users/new?flag=true')
    })

    it('returns the right method', () => {
      let request = routeBuilder.new('users', { flag: true })
      expect(request.method).to.eq('get')
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.new('userPosts')
      expect(request.path).to.eq('user_posts/new')
    })
  })

  describe('.edit', () => {
    it('returns the right path', () => {
      let request = routeBuilder.edit('users', { id: 1, flag: true })
      expect(request.path).to.eq('users/1/edit?flag=true')
    })

    it('returns the right method', () => {
      let request = routeBuilder.edit('users', { id: 1, flag: true })
      expect(request.method).to.eq('get')
    })

    it ('throws an exception when no id is provided', () => {
      let route = () => { routeBuilder.edit('users', { flag: true }) }
      expect(route).to.throw(Error)
    })

    it('converts resource name from camelCase to snake_case', () => {
      let request = routeBuilder.edit('userPosts', { id: 1 })
      expect(request.path).to.eq('user_posts/1/edit')
    })
  })

  describe('.resource', () => {
    it('does not taint the original instance', () => {
      routeBuilder.resource('users')
      expect(routeBuilder.chainedPaths).to.be.empty
    })

    context('resource without id', () => {
      context('single call to .resource', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.resource('users')
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths attribute', () => {
          let newInstance = routeBuilder.resource('users')
          expect(newInstance.chainedPaths).to.have.same.members(['users'])
        })
      })

      context('chained calls to .resource', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.resource('users').resource('blogPost')
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths list', () => {
          let newInstance = routeBuilder.resource('users').resource('blogPosts')
          expect(newInstance.chainedPaths).to.have.same.members(['users', 'blog_posts'])
        })
      })
    })

    context('resource with id', () => {
      context('single call to .resource', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.resource('users', 1)
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths attribute', () => {
          let newInstance = routeBuilder.resource('users', 1)
          expect(newInstance.chainedPaths).to.have.same.members(['users/1'])
        })
      })

      context('chained calls to .resource', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.resource('users', 1).resource('blogPost', 2)
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths list', () => {
          let newInstance = routeBuilder.resource('users', 1).resource('blogPosts', 2)
          expect(newInstance.chainedPaths).to.have.same.members(['users/1', 'blog_posts/2'])
        })
      })
    })
  })

  describe('.namespace', () => {
    it('does not taint the original instance', () => {
      routeBuilder.namespace('users')
      expect(routeBuilder.chainedPaths).to.be.empty
    })

    context('namespace without params', () => {
      context('single call to .namespace', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.namespace('users')
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths attribute', () => {
          let newInstance = routeBuilder.namespace('users')
          expect(newInstance.chainedPaths).to.have.same.members(['users'])
        })
      })

      context('chained calls to .namespace', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.namespace('users').namespace('blog_post')
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths list', () => {
          let newInstance = routeBuilder.namespace('users').namespace('blog_posts')
          expect(newInstance.chainedPaths).to.have.same.members(['users', 'blog_posts'])
        })
      })
    })

    context('namespace with params', () => {
      context('single call to .namespace', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.namespace('users/:id', { id: 1 })
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths attribute', () => {
          let newInstance = routeBuilder.namespace('users/:id', { id: 1 })
          expect(newInstance.chainedPaths).to.have.same.members(['users/1'])
        })
      })

      context('chained calls to .namespace', () => {
        it('returns a new RailsRouteBuilder instance', () => {
          let returnedValue = routeBuilder.namespace('users/:id', { id: 1 }).namespace('blog_post/:id', { id: 2 })
          expect(returnedValue).to.be.an.instanceOf(RailsRouteBuilder)
        })

        it('pushes the right data into the chainedPaths list', () => {
          let newInstance = routeBuilder.namespace('users/:id', { id: 1 }).namespace('blog_posts/:id', { id: 2 })
          expect(newInstance.chainedPaths).to.have.same.members(['users/1', 'blog_posts/2'])
        })
      })
    })
  })
})
