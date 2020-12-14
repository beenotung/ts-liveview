import { expect } from 'chai'
import { getComponentTitle } from './title'

describe('h/title.ts', () => {
  it('should get top-level title', function () {
    expect(
      getComponentTitle({
        selector: '',
        title: 'top-level',
        template_id: '',
        statics: [],
        dynamics: [],
      }),
    ).to.equals('top-level')
  })
  it('should get second-level title', function () {
    expect(
      getComponentTitle({
        selector: '',
        template_id: '',
        statics: [],
        dynamics: [
          {
            selector: '',
            title: 'second-level',
            dynamics: [],
            statics: [],
            template_id: '',
          },
        ],
      }),
    ).to.equals('second-level')
  })
  it('should get third-level title', function () {
    expect(
      getComponentTitle({
        selector: '',
        template_id: '',
        statics: [],
        dynamics: [
          {
            selector: '',
            dynamics: [
              {
                template_id: '',
                statics: [],
                dynamics: [
                  {
                    selector: '',
                    dynamics: [],
                    statics: [],
                    template_id: '',
                    title: 'third-level',
                  },
                ],
                selector: '',
              },
            ],
            statics: [],
            template_id: '',
          },
        ],
      }),
    ).to.equals('third-level')
  })
  it('should get lowest-level title', function () {
    expect(
      getComponentTitle({
        selector: '',
        title: 'top-level',
        template_id: '',
        statics: [],
        dynamics: [
          {
            title: 'second-level',
            selector: '',
            dynamics: [
              {
                template_id: '',
                statics: [],
                dynamics: [
                  {
                    selector: '',
                    dynamics: [],
                    statics: [],
                    template_id: '',
                    title: 'third-level',
                  },
                ],
                selector: '',
              },
            ],
            statics: [],
            template_id: '',
          },
        ],
      }),
    ).to.equals('third-level')
  })
})
