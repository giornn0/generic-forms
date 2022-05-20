export interface ArrayResponse<T>{
    data: T[]
    pagination:Pagination
}

export interface SimpleArrayResponse<T>{
    data: T[]
    total:number,
    last_page:number
}

export interface Pagination{
    actualPage:number,
    resultPerPage:number,
    totalResults:number,
    totalPages:number
    nextPage?:number,
    prevPage?:number
    links: Link
}
export interface Link{
    before:[]
    actual:number,
    after:[]
}
​​
​​
​​
​​
​​
​​