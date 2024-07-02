/** 
 * example of book data
   {
      code: "JK-45",
      title: "Harry Potter",
      author: "J.K Rowling",
      stock: 1
  },
 */

export interface IBook {
  code: string;
  title: string;
  author: string;
  stock: number;
}

export interface IUpsertBook {
  title: string;
  author: string;
  stock: number;
}


export interface IBorrowRecord {
  bookId: number;
  memberId: number;
  borrowedTime: Date;
  moreThanSevenDays: boolean;
}
