export interface OpenAPISpecOptions {
  baseUrl: string
  version: string
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OpenAPISpecGenerator {
  static generateV1p1 (options: OpenAPISpecOptions): any {
    const { baseUrl, version } = options

    return {
      openapi: '3.0.0',
      info: {
        title: 'CASE Service API',
        description: 'Competencies and Academic Standards Exchange (CASE) Service Version 1.1',
        version: version || '1.0.0',
        'x-1edtech-spec-version': '1.1'
      },
      servers: [
        {
          url: baseUrl,
          description: 'CASE Service Provider'
        }
      ],
      tags: [
        {
          name: 'PackagesManager',
          description: 'The set of service operations that manage access to the Competency Framework Packages as a whole. A Competency Framework Package is a package that contains all of the artifacts that are used for the definition of a Competency Framework Document.'
        },
        {
          name: 'DocumentsManager',
          description: 'The set of service operations that manage access to Competency Framework Documents.'
        },
        {
          name: 'ItemsManager',
          description: 'The set of service operations that manage access to Competency Framework Items.'
        },
        {
          name: 'AssociationsManager',
          description: 'The set of service operations that manage access to Competency Framework Associations.'
        },
        {
          name: 'RubricsManager',
          description: 'The set of service operations that manage access to Competency Framework Rubrics.'
        },
        {
          name: 'DefinitionsManager',
          description: 'The set of service operations that manage access to Competency Framework Definitions (Concepts, Subjects, Licenses, Item Types, Association Groupings).'
        }
      ],
      paths: {
        '/ims/case/v1p1/CFPackages/{sourcedId}': {
          get: {
            operationId: 'getCFPackage',
            summary: 'The REST read request message for the getCFPackage() API call.',
            tags: ['PackagesManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Package. If the identified record cannot be found then the \'unknownobject\' status code must be reported.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Document that is to be read from the service provider and supplied with all of its component artefacts.',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully. It is the CFPackage from the service provider.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/CFPackageDType'
                    }
                  }
                }
              },
              400: {
                description: 'An invalid selection field was supplied and data filtering on the selection criteria was not possible i.e. \'invalid_selection_field\'.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/imsx_StatusInfoDType'
                    }
                  }
                }
              },
              401: {
                description: 'The request was not correctly authorised i.e. \'unauthorisedrequest\'.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/imsx_StatusInfoDType'
                    }
                  }
                }
              },
              403: {
                description: 'This is used to indicate that the server can be reached and process the request but refuses to take any further action i.e. \'forbidden\'.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/imsx_StatusInfoDType'
                    }
                  }
                }
              },
              404: {
                description: 'Either the supplied identifier is unknown in the Service Provider and so the object could not be changed or an invalid UUID has been supplied.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/imsx_StatusInfoDType'
                    }
                  }
                }
              },
              429: {
                description: 'The server is receiving too many requests i.e. \'server_busy\'. Retry at a later time.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/imsx_StatusInfoDType'
                    }
                  }
                }
              },
              500: {
                description: 'This code should be used only if there is catastrophic error and there is not a more appropriate code i.e. \'internal_server_error\'.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/imsx_StatusInfoDType'
                    }
                  }
                }
              },
              default: {
                description: 'This is the response data payload to be supplied when the HTTP code is NOT explicitly defined.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/imsx_StatusInfoDType'
                    }
                  }
                }
              }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFDocuments': {
          get: {
            operationId: 'getAllCFDocuments',
            summary: 'The REST read request message for the getAllCFDocuments() API call.',
            tags: ['DocumentsManager'],
            description: 'This is a request to the service provider to provide the information for all Competency Framework Documents. Supports pagination, sorting, filtering, and field selection.',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                required: false,
                description: 'The maximum number of records to be contained in the response.',
                schema: { type: 'integer', minimum: 1 }
              },
              {
                name: 'offset',
                in: 'query',
                required: false,
                description: 'The number of the first record to be supplied in the segmented response message.',
                schema: { type: 'integer', minimum: 0 }
              },
              {
                name: 'sort',
                in: 'query',
                required: false,
                description: 'The sort criteria to be used for the records in the response message.',
                schema: { type: 'string' }
              },
              {
                name: 'orderBy',
                in: 'query',
                required: false,
                description: 'The form of ordering for response to the sorted request.',
                schema: { type: 'string', enum: ['asc', 'desc'] }
              },
              {
                name: 'filter',
                in: 'query',
                required: false,
                description: 'The filtering rules to be applied when identifying the records.',
                schema: { type: 'string' }
              },
              {
                name: 'fields',
                in: 'query',
                required: false,
                description: 'Comma-separated list of fields that should be supplied in the response message.',
                schema: { type: 'string' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CFDocumentSetDType' }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Resource not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFDocuments/{sourcedId}': {
          get: {
            operationId: 'getCFDocument',
            summary: 'The REST read request message for the getCFDocument() API call.',
            tags: ['DocumentsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Document.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Document.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFDocument: { $ref: '#/components/schemas/CFDocumentDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFItems/{sourcedId}': {
          get: {
            operationId: 'getCFItem',
            summary: 'The REST read request message for the getCFItem() API call.',
            tags: ['ItemsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Item.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Item.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFItem: { $ref: '#/components/schemas/CFItemDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFItemAssociations/{sourcedId}': {
          get: {
            operationId: 'getCFItemAssociations',
            summary: 'The REST read request message for the getCFItemAssociations() API call.',
            tags: ['AssociationsManager'],
            description: 'This is a request to the service provider to provide the set of Competency Framework Associations for the specific Competency Framework Item.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Item.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CFAssociationSetDType' }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFAssociations/{sourcedId}': {
          get: {
            operationId: 'getCFAssociation',
            summary: 'The REST read request message for the getCFAssociation() API call.',
            tags: ['AssociationsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Association.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Association.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFAssociation: { $ref: '#/components/schemas/CFAssociationDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFRubrics/{sourcedId}': {
          get: {
            operationId: 'getCFRubric',
            summary: 'The REST read request message for the getCFRubric() API call.',
            tags: ['RubricsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Rubric.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Rubric.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFRubric: { $ref: '#/components/schemas/CFRubricDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFSubjects/{sourcedId}': {
          get: {
            operationId: 'getCFSubject',
            summary: 'The REST read request message for the getCFSubject() API call.',
            tags: ['DefinitionsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Subject.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Subject.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFSubject: { $ref: '#/components/schemas/CFSubjectDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFConcepts/{sourcedId}': {
          get: {
            operationId: 'getCFConcept',
            summary: 'The REST read request message for the getCFConcept() API call.',
            tags: ['DefinitionsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Concept.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Concept.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFConcept: { $ref: '#/components/schemas/CFConceptDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFAssociationGroupings/{sourcedId}': {
          get: {
            operationId: 'getCFAssociationGrouping',
            summary: 'The REST read request message for the getCFAssociationGrouping() API call.',
            tags: ['DefinitionsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Association Grouping.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Association Grouping.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFAssociationGrouping: { $ref: '#/components/schemas/CFAssociationGroupingDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFItemTypes/{sourcedId}': {
          get: {
            operationId: 'getCFItemType',
            summary: 'The REST read request message for the getCFItemType() API call.',
            tags: ['DefinitionsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework Item Type.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Item Type.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFItemType: { $ref: '#/components/schemas/CFItemTypeDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        '/ims/case/v1p1/CFLicenses/{sourcedId}': {
          get: {
            operationId: 'getCFLicense',
            summary: 'The REST read request message for the getCFLicense() API call.',
            tags: ['DefinitionsManager'],
            description: 'This is a request to the service provider to provide the information for the specific Competency Framework License.',
            parameters: [
              {
                name: 'sourcedId',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework License.',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              200: {
                description: 'This is the response when the request has been completed successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        CFLicense: { $ref: '#/components/schemas/CFLicenseDType' }
                      }
                    }
                  }
                }
              },
              400: { description: 'An invalid selection field was supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Server refuses to take action.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              404: { description: 'Either the supplied identifier is unknown or an invalid UUID has been supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              429: { description: 'The server is receiving too many requests.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              default: { description: 'Default error response.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'unrestricted'
          }
        },
        // Management API endpoints (non-CASE-standard extensions)
        '/management/tenants/{tenantId}/CFDocuments/{id}': {
          put: {
            operationId: 'updateCFDocument',
            summary: 'Update a Competency Framework Document (non-CASE-standard extension)',
            tags: ['DocumentsManager'],
            description: 'This endpoint allows updating an existing CFDocument. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and tenant-scoped access.',
            parameters: [
              {
                name: 'tenantId',
                in: 'path',
                required: true,
                description: 'The tenant identifier. Must match the authenticated tenant.',
                schema: { type: 'string' }
              },
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Document to update.',
                schema: { type: 'string', format: 'uuid' }
              },
              {
                name: 'caseVersion',
                in: 'query',
                required: false,
                description: 'The CASE version (1.0 or 1.1). Defaults to 1.1.',
                schema: { type: 'string', enum: ['1.0', '1.1'], default: '1.1' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CFDocumentDType' }
                }
              }
            },
            responses: {
              200: {
                description: 'Document updated successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'updated' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request or validation error.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Tenant mismatch or insufficient permissions.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              404: { description: 'Document not found.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true
          },
          delete: {
            operationId: 'deleteCFDocument',
            summary: 'Delete a Competency Framework Document (non-CASE-standard extension)',
            tags: ['DocumentsManager'],
            description: 'This endpoint allows deleting a CFDocument and all its related data. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and tenant-scoped access.',
            parameters: [
              {
                name: 'tenantId',
                in: 'path',
                required: true,
                description: 'The tenant identifier. Must match the authenticated tenant.',
                schema: { type: 'string' }
              },
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Document to delete.',
                schema: { type: 'string', format: 'uuid' }
              },
              {
                name: 'caseVersion',
                in: 'query',
                required: false,
                description: 'The CASE version (1.0 or 1.1). Defaults to 1.1.',
                schema: { type: 'string', enum: ['1.0', '1.1'], default: '1.1' }
              }
            ],
            responses: {
              200: {
                description: 'Document deleted successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'deleted' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request or validation error.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Tenant mismatch or insufficient permissions.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              404: { description: 'Document not found.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true
          }
        },
        '/management/tenants/{tenantId}/CFItems/{id}': {
          put: {
            operationId: 'updateCFItem',
            summary: 'Update a Competency Framework Item (non-CASE-standard extension)',
            tags: ['ItemsManager'],
            description: 'This endpoint allows updating an existing CFItem. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and tenant-scoped access.',
            parameters: [
              {
                name: 'tenantId',
                in: 'path',
                required: true,
                description: 'The tenant identifier. Must match the authenticated tenant.',
                schema: { type: 'string' }
              },
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Item to update.',
                schema: { type: 'string', format: 'uuid' }
              },
              {
                name: 'caseVersion',
                in: 'query',
                required: false,
                description: 'The CASE version (1.0 or 1.1). Defaults to 1.1.',
                schema: { type: 'string', enum: ['1.0', '1.1'], default: '1.1' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CFItemDType' }
                }
              }
            },
            responses: {
              200: {
                description: 'Item updated successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'updated' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request or validation error.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Tenant mismatch or insufficient permissions.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              404: { description: 'Item not found.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true
          },
          delete: {
            operationId: 'deleteCFItem',
            summary: 'Delete a Competency Framework Item (non-CASE-standard extension)',
            tags: ['ItemsManager'],
            description: 'This endpoint allows deleting a CFItem and its related associations. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and tenant-scoped access.',
            parameters: [
              {
                name: 'tenantId',
                in: 'path',
                required: true,
                description: 'The tenant identifier. Must match the authenticated tenant.',
                schema: { type: 'string' }
              },
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Item to delete.',
                schema: { type: 'string', format: 'uuid' }
              },
              {
                name: 'caseVersion',
                in: 'query',
                required: false,
                description: 'The CASE version (1.0 or 1.1). Defaults to 1.1.',
                schema: { type: 'string', enum: ['1.0', '1.1'], default: '1.1' }
              }
            ],
            responses: {
              200: {
                description: 'Item deleted successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'deleted' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request or validation error.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Tenant mismatch or insufficient permissions.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              404: { description: 'Item not found.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true
          }
        },
        '/management/tenants/{tenantId}/CFAssociations/{id}': {
          put: {
            operationId: 'updateCFAssociation',
            summary: 'Update a Competency Framework Association (non-CASE-standard extension)',
            tags: ['AssociationsManager'],
            description: 'This endpoint allows updating an existing CFAssociation. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and tenant-scoped access.',
            parameters: [
              {
                name: 'tenantId',
                in: 'path',
                required: true,
                description: 'The tenant identifier. Must match the authenticated tenant.',
                schema: { type: 'string' }
              },
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Association to update.',
                schema: { type: 'string', format: 'uuid' }
              },
              {
                name: 'caseVersion',
                in: 'query',
                required: false,
                description: 'The CASE version (1.0 or 1.1). Defaults to 1.1.',
                schema: { type: 'string', enum: ['1.0', '1.1'], default: '1.1' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CFAssociationDType' }
                }
              }
            },
            responses: {
              200: {
                description: 'Association updated successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'updated' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request or validation error.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Tenant mismatch or insufficient permissions.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              404: { description: 'Association not found.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true
          },
          delete: {
            operationId: 'deleteCFAssociation',
            summary: 'Delete a Competency Framework Association (non-CASE-standard extension)',
            tags: ['AssociationsManager'],
            description: 'This endpoint allows deleting a CFAssociation. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and tenant-scoped access.',
            parameters: [
              {
                name: 'tenantId',
                in: 'path',
                required: true,
                description: 'The tenant identifier. Must match the authenticated tenant.',
                schema: { type: 'string' }
              },
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'The UUID that identifies the Competency Framework Association to delete.',
                schema: { type: 'string', format: 'uuid' }
              },
              {
                name: 'caseVersion',
                in: 'query',
                required: false,
                description: 'The CASE version (1.0 or 1.1). Defaults to 1.1.',
                schema: { type: 'string', enum: ['1.0', '1.1'], default: '1.1' }
              }
            ],
            responses: {
              200: {
                description: 'Association deleted successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'deleted' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request or validation error.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Tenant mismatch or insufficient permissions.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              404: { description: 'Association not found.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true
          }
        },
        '/management/tenants/{tenantId}/frameworks': {
          get: {
            operationId: 'listFrameworks',
            summary: 'List all frameworks (packages) for a tenant (non-CASE-standard extension)',
            tags: ['PackagesManager'],
            description: 'This endpoint lists all Competency Framework Packages (frameworks) for a specific tenant. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and tenant-scoped access.',
            parameters: [
              {
                name: 'tenantId',
                in: 'path',
                required: true,
                description: 'The tenant identifier. Must match the authenticated tenant.',
                schema: { type: 'string' }
              },
              {
                name: 'caseVersion',
                in: 'query',
                required: false,
                description: 'Optional filter by CASE version (1.0 or 1.1). If not provided, returns frameworks from all versions.',
                schema: { type: 'string', enum: ['1.0', '1.1'] }
              }
            ],
            responses: {
              200: {
                description: 'List of frameworks retrieved successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        frameworks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              sourcedId: { type: 'string' },
                              title: { type: 'string' },
                              caseVersion: { type: 'string', enum: ['1.0', '1.1'] },
                              language: { type: 'string' },
                              frameworkType: { type: 'string' },
                              subject: { type: 'string' },
                              version: { type: 'string' },
                              lastChangeDateTime: { type: 'string', format: 'date-time' }
                            }
                          }
                        },
                        total: { type: 'integer' },
                        tenantId: { type: 'string' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Tenant mismatch or insufficient permissions.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true
          }
        },
        '/management/tenants': {
          get: {
            operationId: 'listTenants',
            summary: 'List all tenants (non-CASE-standard extension)',
            tags: ['DefinitionsManager'],
            description: 'This endpoint lists all tenants in the system. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and the case.admin scope.',
            parameters: [],
            responses: {
              200: {
                description: 'List of tenants retrieved successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        tenants: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              tenantId: { type: 'string' },
                              hasFrameworks: { type: 'boolean' }
                            }
                          }
                        },
                        total: { type: 'integer' }
                      }
                    }
                  }
                }
              },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Insufficient permissions - case.admin scope required.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true,
            security: [{ BearerAuth: ['case.admin'] }]
          },
          post: {
            operationId: 'createTenant',
            summary: 'Create a new tenant (non-CASE-standard extension)',
            tags: ['DefinitionsManager'],
            description: 'This endpoint creates a new tenant in the system. This is NOT part of the CASE standard specification and is provided as extended functionality for management purposes. Requires authentication and the case.admin scope.',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['tenantId'],
                    properties: {
                      tenantId: {
                        type: 'string',
                        description: 'The identifier for the new tenant. Must contain only alphanumeric characters, hyphens, and underscores.',
                        pattern: '^[a-zA-Z0-9_-]+$'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: 'Tenant created successfully.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'created' },
                        tenantId: { type: 'string' }
                      }
                    }
                  }
                }
              },
              400: { description: 'Invalid request or validation error.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              401: { description: 'The request was not correctly authorised.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } },
              403: { description: 'Insufficient permissions - case.admin scope required.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } } } } },
              409: { description: 'Tenant already exists.', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } },
              500: { description: 'Internal server error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/imsx_StatusInfoDType' } } } }
            },
            'x-1edtech-confidentiality': 'restricted',
            'x-1edtech-extension': true,
            security: [{ BearerAuth: ['case.admin'] }]
          }
        }
      },
      components: {
        schemas: {
          CFPackageDType: {
            type: 'object',
            required: ['CFPackage'],
            properties: {
              CFPackage: {
                type: 'object',
                required: ['CFDocument', 'CFItems', 'CFAssociations'],
                properties: {
                  CFDocument: {
                    $ref: '#/components/schemas/CFDocumentDType'
                  },
                  CFItems: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/CFItemDType'
                    }
                  },
                  CFAssociations: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/CFAssociationDType'
                    }
                  },
                  CFDefinitions: {
                    $ref: '#/components/schemas/CFDefinitionDType'
                  },
                  CFRubrics: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/CFRubricDType'
                    }
                  },
                  extensions: {
                    type: 'object',
                    additionalProperties: true
                  }
                }
              }
            }
          },
          CFDocumentDType: {
            type: 'object',
            required: ['identifier', 'uri', 'creator', 'title', 'lastChangeDateTime'],
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              creator: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              frameworkType: { type: 'string' },
              caseVersion: { type: 'string', enum: ['1.1'] },
              version: { type: 'string' },
              adoptionStatus: { type: 'string' },
              language: { type: 'string' },
              subject: {
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' } }
                ]
              },
              subjectURI: {
                type: 'array',
                items: { $ref: '#/components/schemas/LinkURIDType' }
              },
              officialSourceURL: { type: 'string', format: 'uri' },
              publisher: { type: 'string' },
              licenseURI: { $ref: '#/components/schemas/LinkURIDType' },
              notes: { type: 'string' },
              statusStartDate: { type: 'string', format: 'date' },
              statusEndDate: { type: 'string', format: 'date' },
              CFPackageURI: { $ref: '#/components/schemas/LinkURIDType' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFItemDType: {
            type: 'object',
            required: ['identifier', 'uri', 'fullStatement', 'lastChangeDateTime', 'CFDocumentURI'],
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              fullStatement: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              CFDocumentURI: { $ref: '#/components/schemas/LinkURIDType' },
              humanCodingScheme: { type: 'string' },
              listEnumeration: { type: 'string' },
              alternativeLabel: { type: 'string' },
              abbreviatedStatement: { type: 'string' },
              CFItemType: { type: 'string' },
              CFItemTypeURI: { $ref: '#/components/schemas/LinkURIDType' },
              conceptKeywords: {
                type: 'array',
                items: { type: 'string' }
              },
              conceptKeywordsURI: { $ref: '#/components/schemas/LinkURIDType' },
              notes: { type: 'string' },
              language: { type: 'string' },
              subject: {
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' } }
                ]
              },
              subjectURI: {
                type: 'array',
                items: { $ref: '#/components/schemas/LinkURIDType' }
              },
              educationLevel: {
                type: 'array',
                items: { type: 'string' }
              },
              licenseURI: { $ref: '#/components/schemas/LinkURIDType' },
              statusStartDate: { type: 'string', format: 'date' },
              statusEndDate: { type: 'string', format: 'date' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFAssociationDType: {
            type: 'object',
            required: ['identifier', 'uri', 'associationType', 'originNodeURI', 'destinationNodeURI', 'lastChangeDateTime'],
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              associationType: { type: 'string' },
              originNodeURI: { $ref: '#/components/schemas/LinkURIDType' },
              destinationNodeURI: { $ref: '#/components/schemas/LinkURIDType' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              sequenceNumber: { type: 'integer' },
              CFAssociationGroupingURI: { $ref: '#/components/schemas/LinkURIDType' },
              notes: { type: 'string' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFDefinitionDType: {
            type: 'object',
            properties: {
              CFConcepts: {
                type: 'array',
                items: { $ref: '#/components/schemas/CFConceptDType' }
              },
              CFSubjects: {
                type: 'array',
                items: { $ref: '#/components/schemas/CFSubjectDType' }
              },
              CFLicenses: {
                type: 'array',
                items: { $ref: '#/components/schemas/CFLicenseDType' }
              },
              CFItemTypes: {
                type: 'array',
                items: { $ref: '#/components/schemas/CFItemTypeDType' }
              },
              CFAssociationGroupings: {
                type: 'array',
                items: { $ref: '#/components/schemas/CFAssociationGroupingDType' }
              },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          LinkURIDType: {
            type: 'object',
            required: ['title', 'identifier', 'uri'],
            properties: {
              title: { type: 'string' },
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              targetType: { type: 'string' }
            }
          },
          CFRubricDType: {
            type: 'object',
            description: 'CFRubric structure',
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              title: { type: 'string' },
              description: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              CFRubricCriteria: {
                type: 'array',
                items: { type: 'object' }
              }
            }
          },
          CFConceptDType: {
            type: 'object',
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              title: { type: 'string' },
              hierarchyCode: { type: 'string' },
              description: { type: 'string' },
              keywords: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFSubjectDType: {
            type: 'object',
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              title: { type: 'string' },
              hierarchyCode: { type: 'string' },
              description: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFLicenseDType: {
            type: 'object',
            required: ['identifier', 'uri', 'title', 'licenseText', 'lastChangeDateTime'],
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              title: { type: 'string' },
              description: { type: 'string' },
              licenseText: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFItemTypeDType: {
            type: 'object',
            required: ['identifier', 'uri', 'title', 'description', 'hierarchyCode', 'lastChangeDateTime'],
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              title: { type: 'string' },
              description: { type: 'string' },
              hierarchyCode: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFAssociationGroupingDType: {
            type: 'object',
            properties: {
              identifier: { type: 'string' },
              uri: { type: 'string', format: 'uri' },
              title: { type: 'string' },
              description: { type: 'string' },
              lastChangeDateTime: { type: 'string', format: 'date-time' },
              extensions: {
                type: 'object',
                additionalProperties: true
              }
            }
          },
          CFDocumentSetDType: {
            type: 'object',
            properties: {
              CFDocumentSet: {
                type: 'object',
                required: ['CFDocuments'],
                properties: {
                  CFDocuments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CFDocumentDType' }
                  }
                }
              },
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' }
            }
          },
          CFAssociationSetDType: {
            type: 'object',
            properties: {
              CFAssociationSet: {
                type: 'object',
                required: ['CFAssociations'],
                properties: {
                  CFAssociations: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CFAssociationDType' }
                  }
                }
              }
            }
          },
          imsx_StatusInfoDType: {
            type: 'object',
            required: ['imsx_codeMajor', 'imsx_severity'],
            properties: {
              imsx_codeMajor: {
                type: 'string',
                enum: ['success', 'processing', 'failure', 'unsupported']
              },
              imsx_severity: {
                type: 'string',
                enum: ['status', 'warning', 'error']
              },
              imsx_description: { type: 'string' },
              imsx_codeMinor: {
                type: 'object',
                properties: {
                  imsx_codeMinorField: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['imsx_codeMinorFieldName', 'imsx_codeMinorFieldValue'],
                      properties: {
                        imsx_codeMinorFieldName: { type: 'string' },
                        imsx_codeMinorFieldValue: {
                          type: 'string',
                          enum: [
                            'fullsuccess',
                            'invalid_sort_field',
                            'invalid_selection_field',
                            'forbidden',
                            'unauthorised_request',
                            'internal_server_error',
                            'unknownobject',
                            'server_busy',
                            'invalid_uuid'
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /oauth/token endpoint'
        }
      }
    }
  }
}
