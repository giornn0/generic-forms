export interface ListTemplate{
    [x:string] : any
    title?:string,
    nombreForDelete:string,
    status?:string,
    personalDelete?:boolean,
    estado?:string,
    classEstado?:string,
    specificShow?:boolean,
    specificStatus?:EspecificStatus
    notifications?:number,
    classEstadoChanging?:boolean
    personalEdit?:boolean,
    personalUpload?:boolean,
    subscribable?:SubscriptionStatus
    headIcon?:string,
    header?:string,
    id:number,
    badgeAlert?:boolean,
    alertMessage?:string,
    properties?:PropertyListTemplate[],
    charged?:boolean,
}
export interface TableProperty{
    data:string,
    font:string
}
export interface Relation{
    title:string,
    section:string,
    routeURL:string,
    show?:boolean,
    edit?:boolean,
    icon?:string,
    plusText?:string,
    delete?:boolean,
    routeForReroute:string,
    properties:any
    id:number,
    tableHeaders: string[],
    tableProperties: TableProperty[],
    unique?: any
}
export interface MainListTemplate{
    headIcon:string,
    relations?: Relation[],
}


export interface PropertyListTemplate{
    title?:string,
    icon?:string,
    date?:boolean,
    special?:boolean
    values:Array<PropertyValue>
    actions?:PropertyAction
}

export interface PropertyValue{
    title?:string,
    special?:'resalted'|'picture'
    icon?: string,
    font: string,
    label?: string,
    minWidth?:string,
    dataIcon?:string
    centerLabel?:boolean
    rightLabel?:boolean
    url?:string
    data?: string|number|Date,
}
export interface PropertyAction{
    edit:boolean,
    show:boolean,
    delete?:boolean
    upload?:boolean
    section:string,
    routeURL:string,
    routeForReroute?:string
    id:number,
    plusIcon:string,
    plusTooltip:string,
}
interface EspecificStatus{
    class:string
    label:string
}
export interface SubscriptionStatus{
    status:boolean
}