# e-be-tc

## TODO: 
- Members can borrow books with conditions
    - [x]  Members may not borrow more than 2 books 
    <!-- can add a field of borrowedBooks in the member table -->
    - [x]  Borrowed books are not borrowed by other members
    <!-- just see if book stock > 0 -->
    - [x]  Member is currently not being penalized
    <!-- can add a field of penalty of type date in the member table -->

- Member returns the book with conditions
    - [x]  The returned book is a book that the member has borrowed
    - [x]  If the book is returned after more than 7 days, the member will be subject to a penalty. Member with penalty cannot able to borrow the book for 3 days
- Check the book
    - [x]  Shows all existing books and quantities
    - [x]  Books that are being borrowed are not counted
- Member check
    - [x]  Shows all existing members
    - [x]  The number of books being borrowed by each member

- Others
    - [ ] add more tests
    - [ ] add more swagger docs
    - [ ] deploy 
    - [ ] edit readme
