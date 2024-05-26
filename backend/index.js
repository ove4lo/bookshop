import express from 'express' //библиотека для сервера
import mysql from 'mysql' 
import cors from 'cors'

const app = express()

const db = mysql.createConnection({ //подключение к бд
    host: "localhost",
    user: "root",
    password: "2Banan@",
    database: "bookshop"
})

app.use(express.json())

app.use(cors())

app.get("/books", (req, res) => { //запрос на сервер, чтобы получить все карточки книг
    const sql = "SELECT id, title, photo, author, price FROM book"; 
    db.query(sql, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
        return;
      }
      res.json(result); //возвращаем результат
    });
  });


  app.get("/books/search", (req, res) => { //запрос на сервер для поиска книги по ее названию или автору
    const searchValue = req.query.value;
  
    if (!searchValue) {
      res.status(400).json({ error: "Данный параметр не верен" }); //если ошибка, статус 400 и сам ее вывод в консоль разработчика
      return;
    }
  
    const likeValue = `%${searchValue}%`;
  
    //проверка на название книги
    const titleQuery = "SELECT id, title, photo, author, price FROM book WHERE title LIKE ?"; //частичный поиск по слову с помощью LIKE
    db.query(titleQuery, [likeValue], (err, titleResults) => {
      if (err) {
        res.status(500).json({ error: err.message }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
        return;
      }
      
      if (titleResults.length > 0) { //если название, то возвращаем результат
        res.json(titleResults);
      } else { //если не название, то проверяем на автора
        const authorQuery = "SELECT id, title, photo, author, price FROM book WHERE author LIKE ?";
        db.query(authorQuery, [likeValue], (err, authorResults) => {
          if (err) {
            res.status(500).json({ error: err.message }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
            return;
          }
  
          if (authorResults.length > 0) {
            res.json(authorResults);
          } else {
            res.status(404).json({ message: "Ничего не найдено" }); //если нет совпадений, то возвращем сообщение, что ничего не найдено
          }
        });
      }
    });
  });
  
  app.get("/book/:id", (req, res) => { //запрос на сервер для получения книги по ее id
    const bookId = req.params.id;
  
    //запрос в бд для поиска книги по её id
    const getBookQuery = `
      SELECT 
          b.id, 
          b.title, 
          b.link, 
          b.author, 
          b.photo, 
          b.price, 
          b.house, 
          CAST(b.year AS UNSIGNED) AS year, 
          b.pages, 
          b.isbn, 
          b.annotation
      FROM 
          book b
      WHERE 
          b.id = ?;
    `;
  
    //запрос в бд для поиска связанных категорий
    const getCategoryQuery = `
      SELECT 
          c.id, 
          c.name
      FROM 
          category c
      INNER JOIN 
          book_has_category bc ON c.id = bc.category_id
      WHERE 
          bc.book_id = ?;
    `;
  
    db.query(getBookQuery, [bookId], (err, bookResults) => {
      if (err) {
        res.status(500).json({ error: "Ошибка сервера" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
        return;
      }
  
      if (bookResults.length === 0) {
        res.status(404).json({ error: "Книга не найдена" }); //если нет такой книги, выводим сообщение, что она не найдена
      }
  
      const book = bookResults[0];
  
      db.query(getCategoryQuery, [bookId], (err, categoryResults) => {
        if (err) {
          res.status(500).json({ error: "Ошибка сервера" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
          return;
        }
  

        const categories = categoryResults.map(category => category.name); //результат связанных категорий с книгой

        //добавляем категории
        book.category = categories;
  
        res.json(book); //возвращаем книгу
      });
    });
  });

  app.put("/add", (req, res) => { //запрос на сервер для добавления книги в бд
    const { title, author, link, photo, price, house, year, pages, isbn, annotation, category } = req.body;
  
    const bookQuery = `
      INSERT INTO book (title, author, link, photo, price, house, year, pages, isbn, annotation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.query(bookQuery, [title, author, link, photo, price, house, year, pages, isbn, annotation], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка при добавлении книги" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
      }
  
      const bookId = result.insertId; //получаем id новой книги
  
      if (category && category.length > 0) {
        category.forEach(categoryName => {
          //проверка на существование категорий
          const checkCategoryQuery = `
            SELECT id FROM category WHERE name = ?
          `;
  
          db.query(checkCategoryQuery, [categoryName], (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Ошибка при проверке существования категории" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
            }
  
            if (results.length > 0) {
              //при существовании связываем с книгой
              const categoryId = results[0].id;
              const bindExistingCategoryQuery = `
                INSERT INTO book_has_category (book_id, category_id) VALUES (?, ?)
              `;
  
              db.query(bindExistingCategoryQuery, [bookId, categoryId], (err, result) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: "Ошибка при связывании книги с существующей категорией" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
                }
              });
            } else {
              //если такой нет, то создаем новую
              const insertCategoryQuery = `
                INSERT INTO category (name) VALUES (?)
              `;
  
              db.query(insertCategoryQuery, [categoryName], (err, result) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: "Ошибка при добавлении новой категории" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
                }
  
                const newCategoryId = result.insertId;
                const bindNewCategoryQuery = `
                  INSERT INTO book_has_category (book_id, category_id) VALUES (?, ?)
                `;
  
                db.query(bindNewCategoryQuery, [bookId, newCategoryId], (err, result) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Ошибка при связывании книги с новой категорией" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
                  }
                });
              });
            }
          });
        });
  
        res.status(200).json({ message: "Книга успешно добавлена" });  //если все успешно, показываем сообщение
      } else {
        res.status(200).json({ message: "Книга успешно добавлена" });
      }
    });
  });

  app.delete("/delete/:id", (req, res) => {  //запрос на сервер для удаления книги по ее id
    const bookId = req.params.id;
  
    //удаление связанных с книгой категорий
    const deleteCategoryLinksQuery = `
      DELETE FROM book_has_category WHERE book_id = ?
    `;
  
    db.query(deleteCategoryLinksQuery, [bookId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка при удалении связей книги с категориями" });  //если ошибка, статус 500 и сам ее вывод в консоль разработчика
      }
  
      //удаление книги
      const deleteBookQuery = `
        DELETE FROM book WHERE id = ?
      `;
  
      db.query(deleteBookQuery, [bookId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка при удалении книги" });  //если ошибка, статус 500 и сам ее вывод в консоль разработчика
        }
  
        res.status(200).json({ message: "Книга успешно удалена" });  //если оудалена, то показываем сообщение об успешном удалении
      });
    });
  });


  app.put("/edit/:id", (req, res) => {  //запрос на сервер для редактирования книги по ее id
    //получаем отправленные на сервер данные
    const bookId = req.params.id;
    const { title, author, link, photo, price, house, year, pages, isbn, annotation, category } = req.body;
  
    //обновляем книгу
    const bookQuery = `
      UPDATE book
      SET title = ?, author = ?, link = ?, photo = ?, price = ?, house = ?, year = ?, pages = ?, isbn = ?, annotation = ?
      WHERE id = ?
    `;
  
    db.query(bookQuery, [title, author, link, photo, price, house, year, pages, isbn, annotation, bookId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка при обновлении книги" });  //если ошибка, статус 500 и сам ее вывод в консоль разработчика
      }
  
      //удаление старых связей книги с категориями
      const deleteCategoryLinksQuery = `
        DELETE FROM book_has_category WHERE book_id = ?
      `;
  
      db.query(deleteCategoryLinksQuery, [bookId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка при удалении старых категорий книги" });  //если ошибка, статус 500 и сам ее вывод в консоль разработчика
        }
  
        //созданние связей с новыми категориями
        if (category && category.length > 0) {
          const checkCategoryQuery = `
            SELECT id FROM category WHERE name = ?
          `;
          const insertCategoryQuery = `
            INSERT INTO category (name) VALUES (?)
          `;
          const bindCategoryQuery = `
            INSERT INTO book_has_category (book_id, category_id) VALUES (?, ?)
          `;
  
          const promises = category.map(cat => {
            return new Promise((resolve, reject) => {
              db.query(checkCategoryQuery, [cat], (err, result) => {
                if (err) {
                  return reject(err);
                }
  
                if (result.length > 0) {
                  const categoryId = result[0].id;
                  db.query(bindCategoryQuery, [bookId, categoryId], (err, result) => {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  });
                } else {
                  db.query(insertCategoryQuery, [cat], (err, result) => {
                    if (err) {
                      return reject(err);
                    }
  
                    const newCategoryId = result.insertId;
                    db.query(bindCategoryQuery, [bookId, newCategoryId], (err, result) => {
                      if (err) {
                        return reject(err);
                      }
                      resolve();
                    });
                  });
                }
              });
            });
          });
  
          Promise.all(promises)
            .then(() => res.status(200).json({ message: "Книга успешно обновлена" })) //если операция успешно, выводим сообщение
            .catch(err => {
              console.error(err);
              res.status(500).json({ error: "Ошибка при обновлении категорий книги" }); //если ошибка, статус 500 и сам ее вывод в консоль разработчика
            });
        } else {
          res.status(200).json({ message: "Книга успешно обновлена" });
        }
      });
    });
  });

app.listen(8800, () => {  //связь с сервером
    console.log("connected to backend")
})