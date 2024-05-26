from builtins import classmethod, int, len, print, str
import requests
from bs4 import BeautifulSoup as BS
import re
import pymysql

def add_book_to_bd(book): #добавление книги в базу данных
    try:
        
        connection = pymysql.connect( #подключение к базе данных
            host='localhost',
            user='root',
            password='2Banan@',
            database='bookshop',
            cursorclass=pymysql.cursors.DictCursor
        )

        cursor = connection.cursor() #курсор для выполнения SQL-запросов

        # Заменяем все значения None на соответствующие типы данных
        title = book.title if book.title is not None else "Не указано"
        link = book.link if book.link is not None else "Не указано"
        photo = book.photo if book.photo is not None else "Не указано"
        author = book.author if book.author is not None else "Не указано"
        house = book.house if book.house is not None else "Не указано"
        year = book.year if book.year is not None else "Не указано"
        pages = book.pages if book.pages is not None else 0
        isbn = book.isbn if book.isbn is not None else "Не указано"
        price = book.price if book.price is not None else None
        annotation = book.annotation if book.annotation is not None else "Не указано"
        categories = book.category if book.category is not [] else ["Не указано"]

        #проверка на существование книги с таким же названием
        check_existing_query = """
        SELECT id, price FROM book WHERE title = %s
        """
        cursor.execute(check_existing_query, (title,))
        existing_book = cursor.fetchone()

        if existing_book:
            if isinstance(price, (int, float)) and isinstance(existing_book['price'], (int, float)):  #если есть, сравниваем цены
                if price is not None and (existing_book['price'] is None or price < existing_book['price']): 
                    update_book_query = """
                    UPDATE book SET link = %s, photo = %s, author = %s, house = %s, year = %s, pages = %s, isbn = %s, price = %s, annotation = %s WHERE id = %s
                    """
                    cursor.execute(update_book_query, (link, photo, author, house, year, pages, isbn, price, annotation, existing_book['id']))
            else:
                print('Такая книга уже есть')
        else:
            #если нет, то добавляем новую книгу
            insert_book_query = """
            INSERT INTO book (title, link, photo, author, house, year, pages, isbn, price, annotation)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_book_query, (title, link, photo, author, house, year, pages, isbn, price, annotation))
            
            new_book_id = cursor.lastrowid #id книги

            if categories: #категории книги
                for category_name in categories:
                    #проверка на существование категории
                    check_category_query = """
                    SELECT id FROM category WHERE name = %s
                    """
                    cursor.execute(check_category_query, (category_name,))
                    existing_category = cursor.fetchone()

                    if existing_category:
                        #если существует, то используем ее
                        bind_existing_category_query = """
                        INSERT INTO book_has_category (book_id, category_id) VALUES (%s, %s)
                        """
                        cursor.execute(bind_existing_category_query, (new_book_id, existing_category['id']))
                    else:
                        #если нет, то создаем новую
                        insert_category_query = """
                        INSERT INTO category (name) VALUES (%s)
                        """
                        cursor.execute(insert_category_query, (category_name,))
                        #id категории
                        new_category_id = cursor.lastrowid

                        #книга к категории, категория к книге
                        bind_new_category_query = """
                        INSERT INTO book_has_category (book_id, category_id) VALUES (%s, %s)
                        """
                        cursor.execute(bind_new_category_query, (new_book_id, new_category_id))

        connection.commit()
        print('Книга успешно добавлена или обновлена в базе данных.')
    except Exception as ex:
        print('Произошла ошибка при добавлении книги в базу данных:')
        print(ex)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

def check_for_duplicates(): #дополнительная проверка на дупликаты
    try:
        #подключение к базе данных
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='2Banan@',
            database='bookshop',
            cursorclass=pymysql.cursors.DictCursor
        )

        cursor = connection.cursor()  #курсор для выполнения SQL-запросов

        #поиск дубликатов по полю title
        duplicates_query = """
        SELECT title, COUNT(*) as count
        FROM book
        GROUP BY title
        HAVING count > 1
        """

        cursor.execute(duplicates_query)

        duplicates = cursor.fetchall()  #получение результата

        if duplicates:
            print("Найдены дубликаты:")
            for duplicate in duplicates:
                print(f"Книга '{duplicate['title']}' встречается {duplicate['count']} раз(а).")
        else:
            print("Дубликатов не найдено.")

    except Exception as ex:
        print('Произошла ошибка при выполнении запроса:')
        print(ex)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

class Book: #класс книги
    def __init__(self, title, link, author, photo, price, house, year, pages, isbn, annotation, category): #инициализация
        self.title = title 
        self.link = link 
        self.author = author 
        self.house = house 
        self.year = year 
        self.pages = pages 
        self.isbn = isbn 
        self.price = price 
        self.annotation = annotation 
        self.photo = photo 
        self.category = category 

    @classmethod
    def create_book(cls, title, link, author, photo, price, house, year, pages, isbn, annotation, category): #мктод создания объекта
        return cls(title, link, author, photo, price, house, year, pages, isbn, annotation, category)
    
    def __str__(self): #вывод книги
        return f"Название: {self.title}\n" \
            f"Ссылка: {self.link}\n" \
            f"Автор: {self.author}\n" \
            f"Фото: {self.photo}\n" \
            f"Цена: {self.price}\n" \
            f"Издательство: {self.house}\n" \
            f"Год издания: {self.year}\n" \
            f"Количество страниц: {self.pages}\n" \
            f"ISBN: {self.isbn}\n" \
            f"Аннотация: {self.annotation}\n" \
            f"Категория: {self.category}\n" 
    
def input_book_details_chg(link): #парсер информации о книге в Читай-городе
    headers = requests.utils.default_headers()
    headers.update(
    {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    }
    )

    #получение страницы книги
    r = requests.get(link, headers=headers)
    html = BS(r.content, 'html.parser')

    #парсинг данных о книге
    title_tag = html.select_one(".detail-product__header-title") #название книги
    title = title_tag.text.strip() if title_tag else None

    author_tag = html.select_one(".product-info-authors__author") #автор
    author = author_tag.text.strip() if author_tag else None

    img_tag = html.select_one(".product-info-gallery__poster img") #главная фотография
    photo = img_tag['src'] if img_tag else None

    price_tag = html.select_one(".product-offer-price__current") #цена
    price = price_tag.get("content") if price_tag else None

    house_tag = html.select_one(".product-detail-features__item-title:-soup-contains('Издательство') + .product-detail-features__item-value") #название издательства
    house = house_tag.text.strip() if house_tag else None

    year_tag = html.select_one(".product-detail-features__item-title:-soup-contains('Год издания') + .product-detail-features__item-value") #год выпуска
    year = year_tag.text.strip() if year_tag else None

    isbn_tag = html.select_one(".product-detail-features__item-title:-soup-contains('ISBN') + .product-detail-features__item-value") #isbn
    isbn = isbn_tag.text.strip() if isbn_tag else None

    pages_tag = html.select_one(".product-detail-features__item-title:-soup-contains('Количество страниц') + .product-detail-features__item-value") #кол-во страниц
    pages = pages_tag.text.strip() if pages_tag else None

    annotation_tag = html.select_one(".detail-description__text") #аннотация к книге
    annotation = annotation_tag.text.strip() if annotation_tag else None

    category_tag = html.select('span[itemprop="name"]')[1:]  #категории книги
    if category_tag:
        category = [tag.text.strip() for tag in category_tag] 
    else:
        category = ["Не указано"]

    book = Book.create_book(title, link, author, photo, price, house, year, pages, isbn, annotation, category) #создание объекта класса Book
    return book #возвращаем книгу

def input_book_details_lab(link, title): #парсер информации о книге в Лабиринте
    headers = requests.utils.default_headers()
    headers.update(
    {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    }
    )

    #получение страницы книги
    r = requests.get(link, headers=headers)
    html = BS(r.content, 'html.parser')

    #парсинг данных о книге
    author_tag = html.select_one(".authors a") #автор
    author = author_tag.text.strip() if author_tag else None

    house_year_tag = html.select_one(".publisher") #название издательства и год выпуска
    if house_year_tag:
        publisher_text = house_year_tag.get_text()
        parts = publisher_text.split(', ')
        house = parts[0].split(': ')[1]
        year = parts[1].split()[0]
    else:
        house = None
        year = None

    pages_tag = html.select_one(".js-open-block-page_count") #кол-во страниц
    if pages_tag:
        pages = pages_tag.get('data-pages') 
    else:
        pages_tag = html.select_one(".pages2")
        if pages_tag:
            pages_text = pages_tag.text.strip() 
            pages = re.search(r'\d+', pages_text).group()
        else:
            pages = None

    isbn_tag = html.select_one("#productisbns") #isbn
    if isbn_tag:
        isbn_text = isbn_tag.text.strip().split(',')[1]  
        isbn = isbn_text.replace('скрыть', '').strip()
    else:
        isbn_tag = html.select_one(".isbn")
        isbn = isbn_tag.text.strip().split(': ')[1]  if isbn_tag else None

    price_tag = html.select_one('.buying-pricenew-val .buying-pricenew-val-number') #цена
    if price_tag:
        price = price_tag.text.strip() 
    else:
        price_tag = html.select_one('.buying-price-val-number')
        price = price_tag.text.strip() if price_tag else None

    annotation_tag = html.select_one('#product-about p') #аннотация к книге
    annotation = annotation_tag.text.strip() if annotation_tag else None
    
    img_tag = html.select_one("#product-image img") #главная фотография
    photo = img_tag['data-src'] if img_tag else None

    category_tag = html.select('#thermometer-books span[itemprop="itemListElement"]')[1:]  #категории книги
    if category_tag:
        category_list = [tag.text.strip() for tag in category_tag]
        categories = [category.replace('\xa0/', '') for category in category_list]
    else:
        categories = ["Не указано"]
   

    book = Book.create_book(title, link, author, photo, price, house, year, pages, isbn, annotation, categories) #создание объекта класса Book
    return book #возвращаем книгу

def input_book_details_bukvoed(link): #парсер информации о книге в Буквоеде
    headers = requests.utils.default_headers()
    headers.update(
    {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    }
    )

    r = requests.get(link, headers=headers)
    html = BS(r.content, 'html.parser')

    # Парсинг данных о книге
    title_tag = html.select_one(".product-title-author__title") #название книги
    title = title_tag.text.strip() if title_tag else None

    photo = "https://"+ html.select_one(".product-preview__big-img-button")['style'][23:-2] #главная фотография

    house_tag = html.find('th', string='Издательство') #название издательства
    house = house_tag.find_next_sibling('td').text.strip() if house_tag else None

    author_tag = html.find('th', string='Автор') #автор
    author = author_tag.find_next_sibling('td').text.strip() if author_tag else None

    pages_tag = html.find('th', string='Кол-во страниц') #кол-во страниц
    pages = pages_tag.find_next_sibling('td').text.strip() if pages_tag else None

    year_tag = html.find('th', string='Год издания') #год издания
    year = year_tag.find_next_sibling('td').text.strip() if year_tag else None

    isbn_tag = html.find('th', string='ISBN') #isbn
    isbn = isbn_tag.find_next_sibling('td').text.strip() if isbn_tag else None
    
    annotation_tag = html.select_one(".product-annotation-full__text") #аннотация к книге
    annotation = annotation_tag.text.strip() if annotation_tag else None

    category_tag = html.select('.breadcrumbs__item')[2:] #категории книги
    if category_tag:
        categories_text = [item.find('span').text.strip() for item in category_tag]
        categories= [item.replace('\xa0', ' ') for item in categories_text]
    else:
        categories = ["Не указано"]

    price_tag = html.select_one(".price-block-price-info__price") #цена
    span_tags = price_tag.find_all('span')
    price_text = span_tags[0].text.strip()
    price = ''.join(filter(str.isdigit, price_text))

    book = Book.create_book(title, link, author, photo, price, house, year, pages, isbn, annotation, categories) #создание объекта класса Book
    return book #возвращаем книгу

def parcer_chg(): #парсер основной страницы Читай-Города, каталог
    i = 1
    page = 1  
    while page < 3: 
        headers = requests.utils.default_headers()
        headers.update(
        {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        }
        )

        r = requests.get("https://www.chitai-gorod.ru/catalog/books-18030?page=" + str(page), headers=headers) #постраничный парсер
        html = BS(r.content, 'html.parser')
        products = html.select(".products-list > .product-card") #все книги

        if len(products): 
            for el in products:
                link = "https://www.chitai-gorod.ru" + el.find('a')['href'] #ссылка на книгу
                book = input_book_details_chg(link) #передача ссылки и создания объекта book
                add_book_to_bd(book) #вызываем функцию для добавления книги в бд
                i += 1
                if i > 20: #ограничение на количество книг
                    break
            if i > 20:
                break
            page += 1
        else: 
            break

def parcer_lab(): #парсер основной страницы Лабиринта, каталог
    i = 1
    page = 1  
    while page < 3:
        headers = requests.utils.default_headers()
        headers.update(
        {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        }
        )

        r = requests.get("https://www.labirint.ru/books/?page=" + str(page), headers=headers)
        html = BS(r.content, 'html.parser')
        products = html.select(".genres-carousel__container > .genres-carousel__item") #все книги

        if len(products):
            for el in products:
                title = el.find('span', class_='product-title').text
                link = "https://www.labirint.ru" + el.find('a', class_='product-title-link')['href'] #ссылка на книгу

                book = input_book_details_lab(link, title) #передача ссылки и названия книг  для получения подробной инофрмации
                add_book_to_bd(book) #добавление книги в бд
                i += 1
                if i > 20: #ограничение на кол-во книг
                    break
            if i > 20:
                break
            page += 1
        else:
            break

def parcer_bookvoed(): #парсер основной страницы Буквоеда, каталог     
    i = 1
    page = 1  
    while page < 3:
        headers = requests.utils.default_headers()
        headers.update(
        {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        }
        )

        r = requests.get("https://www.bookvoed.ru/catalog?page=" + str(page), headers=headers)
        html = BS(r.content, 'html.parser')
        products = html.select(".product-list > .product-card") #все книги
        if len(products):
            for el in products:
                #получение ссылки книги
                link = "https://www.bookvoed.ru" + el.find('a', class_='ui-link ui-link__color-scheme--two product-description__link base-link')['href']
                book = input_book_details_bukvoed(link) #передача ссылки для получения детальной информации о книге
                add_book_to_bd(book) #добавление книги в бд
                i += 1
                if i > 20:
                    break
            if i > 20:
                break
            page += 1
        else:
            break

check_for_duplicates()