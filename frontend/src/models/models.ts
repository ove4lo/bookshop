/*интерфейс книги*/
export interface IBook {
    id: number;
    title: string;
    link: string;
    author: string;
    photo: string;
    price: number;
    house: string;
    year: number;
    pages: number;
    isbn: string;
    annotation: string;
    category: string[]; 
}
