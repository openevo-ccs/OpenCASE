import { type CFDocument } from './CFDocument'
import { type CFItem } from './CFItem'
import { type CFAssociation } from './CFAssociation'

export interface CFPackageProps {
  document: CFDocument
  items: CFItem[]
  associations: CFAssociation[]
  rubrics: any[] // placeholder
}

export class CFPackage {
  constructor (private readonly props: CFPackageProps) {}

  get document (): CFDocument { return this.props.document }
  get items (): CFItem[] { return this.props.items }
  get associations (): CFAssociation[] { return this.props.associations }
  get rubrics (): any[] { return this.props.rubrics }
}
