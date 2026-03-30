import os
import sqlite3
from dotenv import load_dotenv
load_dotenv()

# Optional Postgres support via DATABASE_URL (e.g. provided by Render)
DATABASE_URL = os.environ.get('DATABASE_URL')

USE_POSTGRES = bool(DATABASE_URL)

if USE_POSTGRES:
    import psycopg2
    import psycopg2.extras


def init_database():
    """Initialize the database with required tables.

    Uses Postgres when `DATABASE_URL` is provided, otherwise falls back to SQLite.
    """
    if USE_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS visitors (
                id SERIAL PRIMARY KEY,
                count INTEGER NOT NULL DEFAULT 0
            )
        ''')
        cur.execute('SELECT COUNT(*) FROM visitors')
        if cur.fetchone()[0] == 0:
            cur.execute('INSERT INTO visitors (count) VALUES (0)')
        conn.commit()
        cur.close()
        conn.close()
        print('✅ Postgres database initialized')
    else:
        db_path = os.environ.get('SQLITE_PATH', 'portfolio.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS visitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                count INTEGER NOT NULL DEFAULT 0
            )
        ''')
        cursor.execute('SELECT COUNT(*) FROM visitors')
        if cursor.fetchone()[0] == 0:
            cursor.execute('INSERT INTO visitors (count) VALUES (0)')
        conn.commit()
        conn.close()
        print('✅ SQLite database initialized')


def add_contact(name, email, message):
    try:
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            cur.execute(
                'INSERT INTO contacts (name, email, message) VALUES (%s, %s, %s)',
                (name, email, message)
            )
            conn.commit()
            cur.close()
            conn.close()
            return True
        else:
            db_path = os.environ.get('SQLITE_PATH', 'portfolio.db')
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
                (name, email, message)
            )
            conn.commit()
            conn.close()
            return True
    except Exception as e:
        print(f"Error adding contact: {e}")
        return False


def get_all_contacts():
    if USE_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute('SELECT id, name, email, message FROM contacts ORDER BY id DESC')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        # rows are RealDictRow which behave like dicts
        return rows
    else:
        db_path = os.environ.get('SQLITE_PATH', 'portfolio.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM contacts ORDER BY id DESC')
        contacts = cursor.fetchall()
        conn.close()
        return contacts


def get_visitor_count():
    if USE_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute('SELECT count FROM visitors WHERE id = 1')
        res = cur.fetchone()
        cur.close()
        conn.close()
        return res[0] if res else 0
    else:
        db_path = os.environ.get('SQLITE_PATH', 'portfolio.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT count FROM visitors WHERE id = 1')
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else 0


def increment_visitor_count():
    if USE_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute('UPDATE visitors SET count = count + 1 WHERE id = 1 RETURNING count')
        new_count = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return new_count
    else:
        db_path = os.environ.get('SQLITE_PATH', 'portfolio.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('UPDATE visitors SET count = count + 1 WHERE id = 1')
        conn.commit()
        cursor.execute('SELECT count FROM visitors WHERE id = 1')
        new_count = cursor.fetchone()[0]
        conn.close()
        return new_count


if __name__ == '__main__':
    init_database()
    print('Database setup complete!')
