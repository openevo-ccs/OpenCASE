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
      }
    }
  }
}
