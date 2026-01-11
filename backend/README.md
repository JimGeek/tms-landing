# The Metal Store Backend

This is the Django backend for The Metal Store e-commerce platform.

## Setup
1.  **Environment**: Ensure you are in the `backend` directory.
2.  **Activate Virtual Env**: `source venv/bin/activate`
3.  **Install Dependencies**: `pip install -r requirements.txt` (if exists) or manual install.

## Running the Server
```bash
python manage.py runserver
```

## API Endpoints
- `http://localhost:8000/api/products/` - List products
- `http://localhost:8000/api/categories/` - List categories
- `http://localhost:8000/admin/` - Admin panel

## Superuser
To access the admin panel, create a superuser:
```bash
python manage.py createsuperuser
```
