# BE-1: Backend Store Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the GeniusOS `ecommerce` API serve a brand-scoped, richly-modeled product catalog so The Metal Store storefront (`?brand=themetalstore`) returns real products with images and customization options.

**Architecture:** Add a required `brand` FK to `Category`/`Product` plus rich-catalog fields (`product_type`, `price_unit`, `has_3d`, `model_config`) and three new models (`ProductImage`, `ProductOption`, `ProductOptionValue`). Store endpoints resolve brand from a `?brand=<slug>` query param via a small reusable helper and filter on it (also adding the missing `is_active` filter). A safe 3-migration sequence (add nullable brand → backfill → make required + unique constraints) keeps the live DB intact. The `seed_products` command is rewritten to be brand-scoped, richly-modeled, and idempotent.

**Tech Stack:** Django + Django REST Framework, SQLite (local) / Postgres (prod), pytest + DRF `APITestCase`. Responses wrapped by `utils.renderers.EnvelopeJSONRenderer` as `{success, data, errors}`.

---

## ⚠️ Critical context for the implementer

- **The backend code lives in a DIFFERENT repository** from this plan. All file paths below are relative to:
  `/Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend/`
  All `git` commits in this plan happen **in the GeniusOS repo**, not the themetalstore-landing repo.
- **Run everything from the backend dir using its venv.** Prefix shell steps with:
  ```bash
  cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend
  source venv/bin/activate    # interpreter: venv/bin/python (Python 3.9)
  ```
  Tests run with `pytest` (config in `pytest.ini`, `DJANGO_SETTINGS_MODULE=config.settings`).
- **The Metal Store brand** is `slug='themetalstore'` in `brands.models.Brand`. Confirm it exists before seeding (Task 9 handles the missing-brand case).
- **Response envelope:** every API response is wrapped. In tests, read the body as `resp.json()['data']` for success and `resp.json()['errors']` for errors (status ≥ 400). Pattern already used in `rooms/tests/test_api.py`.
- **Brand-by-slug resolution** mirrors the existing pattern in `chat/views.py:36` (`get_object_or_404(Brand, slug=...)`).
- **Backward-compat note:** after this plan, `GET /api/v1/store/products/` with NO `?brand=` returns **400** (was `[]`). The only caller is this storefront; acceptable per spec §4.

**Reference spec:** `themetalstore-landing/docs/superpowers/specs/2026-06-01-backend-store-foundation-design.md`

---

## File Structure

**Create (in GeniusOS/backend):**
- `ecommerce/brand_utils.py` — `resolve_brand(request)` helper (single responsibility: query-param → Brand or 400).
- `ecommerce/migrations/0003_*.py` — additive: nullable `brand` + new fields + new models.
- `ecommerce/migrations/0004_*.py` — data migration: backfill `brand` → themetalstore.
- `ecommerce/migrations/0005_*.py` — make `brand` required + `unique_together(brand, slug)`.
- `ecommerce/tests/__init__.py`
- `ecommerce/tests/test_models.py` — model-level brand scoping, option pricing.
- `ecommerce/tests/test_api.py` — brand-filtered list/detail/categories behavior.
- `ecommerce/tests/test_seed.py` — seed idempotency + brand attachment.

**Modify (in GeniusOS/backend):**
- `ecommerce/models.py` — add fields + 3 new models.
- `ecommerce/serializers.py` — nested images/options, new fields.
- `ecommerce/views.py` — brand filtering in `ProductViewSet`/`CategoryViewSet`.
- `ecommerce/admin.py` — brand columns/filters + inlines.
- `ecommerce/management/commands/seed_products.py` — full rewrite (brand-scoped, rich, idempotent).
- `ecommerce/tests.py` — **delete** (replaced by `tests/` package).

---

## Task 1: Add new model fields and models (no constraints yet)

**Files:**
- Modify: `ecommerce/models.py`

- [ ] **Step 1: Add `product_type` choices + new fields to `Product`, add `brand` (nullable) to both models, and append the three new models.**

In `ecommerce/models.py`, modify `Category` (lines 6-16) to add a nullable `brand` FK (insert after `class Category(models.Model):` first line):

```python
class Category(models.Model):
    brand = models.ForeignKey('brands.Brand', related_name='categories', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField()  # uniqueness handled via Meta.unique_together in a later migration
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name
```

Modify `Product` (lines 19-37) to add `brand`, `product_type`, `price_unit`, `has_3d`, `model_config` and relax `slug` uniqueness:

```python
class Product(models.Model):
    PRODUCT_TYPE_CHOICES = (
        ('stock', 'Stock'),
        ('made_to_order', 'Made to Order'),
    )

    brand = models.ForeignKey('brands.Brand', related_name='products', on_delete=models.CASCADE, null=True, blank=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    slug = models.SlugField()  # uniqueness handled via Meta.unique_together in a later migration
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_unit = models.CharField(max_length=30, blank=True, help_text="e.g. '/sqft', 'Free', 'Starting @'")
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, default='stock')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    has_3d = models.BooleanField(default=False)
    model_config = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock_quantity > 0
```

Append the three new models at the **end** of `ecommerce/models.py`:

```python
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductOption(models.Model):
    OPTION_TYPE_CHOICES = (
        ('color', 'Color'),
        ('select', 'Select'),
    )
    product = models.ForeignKey(Product, related_name='options', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    option_type = models.CharField(max_length=20, choices=OPTION_TYPE_CHOICES, default='select')
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductOptionValue(models.Model):
    option = models.ForeignKey(ProductOption, related_name='values', on_delete=models.CASCADE)
    value = models.CharField(max_length=100)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.option.name}: {self.value}"
```

- [ ] **Step 2: Generate the additive migration.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
python manage.py makemigrations ecommerce
```
Expected: creates `ecommerce/migrations/0003_*.py` adding `brand` (nullable), `product_type`, `price_unit`, `has_3d`, `model_config`, and models `ProductImage`, `ProductOption`, `ProductOptionValue`. It must NOT prompt for a one-off default (brand is nullable). If prompted about removing `slug` unique, accept — uniqueness moves to Task 3.

- [ ] **Step 3: Apply the migration.**

Run:
```bash
python manage.py migrate ecommerce
```
Expected: `OK`, no errors.

- [ ] **Step 4: Sanity-check the schema in a shell.**

Run:
```bash
python manage.py shell -c "from ecommerce.models import Product, ProductOption, ProductOptionValue, ProductImage; print('ok', Product._meta.get_field('brand').null, Product._meta.get_field('product_type').choices)"
```
Expected: prints `ok True (('stock', 'Stock'), ('made_to_order', 'Made to Order'))`.

- [ ] **Step 5: Commit.**

```bash
git add ecommerce/models.py ecommerce/migrations/0003_*.py
git commit -m "feat(ecommerce): add brand fk, product type, and product option/image models"
```

---

## Task 2: Backfill existing rows to The Metal Store (data migration)

**Files:**
- Create: `ecommerce/migrations/0004_backfill_brand.py`

- [ ] **Step 1: Create an empty migration to hold the data operation.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
python manage.py makemigrations ecommerce --empty --name backfill_brand
```
Expected: creates `ecommerce/migrations/0004_backfill_brand.py`.

- [ ] **Step 2: Write the forward/backward data functions.**

Replace the contents of `ecommerce/migrations/0004_backfill_brand.py` with:

```python
from django.db import migrations


def backfill_brand(apps, schema_editor):
    Brand = apps.get_model('brands', 'Brand')
    Category = apps.get_model('ecommerce', 'Category')
    Product = apps.get_model('ecommerce', 'Product')

    tms = Brand.objects.filter(slug='themetalstore').first()
    if not tms:
        # No TMS brand in this DB (e.g. fresh test DB) and tables are empty — nothing to backfill.
        if Category.objects.exists() or Product.objects.exists():
            raise RuntimeError(
                "ecommerce rows exist but brand 'themetalstore' is missing; "
                "create the Brand before migrating."
            )
        return

    Category.objects.filter(brand__isnull=True).update(brand=tms)
    Product.objects.filter(brand__isnull=True).update(brand=tms)


def reverse_noop(apps, schema_editor):
    # Irreversible data backfill; no-op on reverse.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('ecommerce', '0003_productimage_product_brand_and_more'),  # adjust to actual 0003 name
    ]
    operations = [
        migrations.RunPython(backfill_brand, reverse_noop),
    ]
```

NOTE: set the dependency to the **actual** filename produced in Task 1 Step 2 (run `ls ecommerce/migrations/` to confirm the `0003_*` name, e.g. `0003_productimage_product_brand_and_more`).

- [ ] **Step 3: Apply the data migration.**

Run:
```bash
python manage.py migrate ecommerce
```
Expected: `OK`. On a DB with no products/no TMS brand it is a clean no-op.

- [ ] **Step 4: Commit.**

```bash
git add ecommerce/migrations/0004_backfill_brand.py
git commit -m "feat(ecommerce): backfill existing catalog rows to themetalstore brand"
```

---

## Task 3: Make `brand` required + brand-scoped slug uniqueness

**Files:**
- Modify: `ecommerce/models.py`

- [ ] **Step 1: Remove `null=True, blank=True` from both `brand` FKs and add `unique_together`.**

In `ecommerce/models.py`, change `Category.brand` to:
```python
    brand = models.ForeignKey('brands.Brand', related_name='categories', on_delete=models.CASCADE)
```
and add to `Category.Meta`:
```python
    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ('brand', 'slug')
```

Change `Product.brand` to:
```python
    brand = models.ForeignKey('brands.Brand', related_name='products', on_delete=models.CASCADE)
```
and add a `Meta` class to `Product` (it currently has none):
```python
    class Meta:
        unique_together = ('brand', 'slug')
```
(Place `class Meta` above the `def __str__` method.)

- [ ] **Step 2: Generate the constraint migration.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
python manage.py makemigrations ecommerce --name require_brand_and_unique_slug
```
Expected: creates `0005_require_brand_and_unique_slug.py` with `AlterField` (brand non-null) + `AlterUniqueTogether` for both models. If prompted for a default because rows might have null brand, answer "Ignore for now" only if you are certain Task 2 backfilled — otherwise re-run Task 2. On an empty DB there will be no prompt.

- [ ] **Step 3: Apply the migration.**

Run:
```bash
python manage.py migrate ecommerce
```
Expected: `OK`.

- [ ] **Step 4: Verify constraints exist.**

Run:
```bash
python manage.py shell -c "from ecommerce.models import Product, Category; print(Product._meta.unique_together, Category._meta.unique_together, Product._meta.get_field('brand').null)"
```
Expected: `(('brand', 'slug'),) (('brand', 'slug'),) False`.

- [ ] **Step 5: Commit.**

```bash
git add ecommerce/models.py ecommerce/migrations/0005_require_brand_and_unique_slug.py
git commit -m "feat(ecommerce): require brand and enforce brand-scoped slug uniqueness"
```

---

## Task 4: Model tests — brand scoping and option pricing

**Files:**
- Create: `ecommerce/tests/__init__.py`
- Create: `ecommerce/tests/test_models.py`
- Delete: `ecommerce/tests.py`

- [ ] **Step 1: Remove the placeholder tests module and create the tests package.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend
git rm ecommerce/tests.py
mkdir -p ecommerce/tests
touch ecommerce/tests/__init__.py
```

- [ ] **Step 2: Write the failing model tests.**

Create `ecommerce/tests/test_models.py`:

```python
from decimal import Decimal
from django.test import TestCase
from django.db import IntegrityError
from brands.models import Brand
from ecommerce.models import Category, Product, ProductOption, ProductOptionValue


class CatalogModelTest(TestCase):
    def setUp(self):
        self.tms = Brand.objects.create(name='The Metal Store', slug='themetalstore')
        self.other = Brand.objects.create(name='Marvel Homes', slug='marvel-homes')
        self.cat = Category.objects.create(brand=self.tms, name='Gates', slug='gates')

    def test_two_brands_can_share_a_category_slug(self):
        # Same slug under a different brand is allowed.
        c2 = Category.objects.create(brand=self.other, name='Gates', slug='gates')
        self.assertEqual(c2.slug, 'gates')

    def test_same_brand_cannot_duplicate_category_slug(self):
        with self.assertRaises(IntegrityError):
            Category.objects.create(brand=self.tms, name='Gates 2', slug='gates')

    def test_two_brands_can_share_a_product_slug(self):
        p1 = Product.objects.create(brand=self.tms, category=self.cat, name='Swing', slug='swing', description='x', price=Decimal('100'))
        cat2 = Category.objects.create(brand=self.other, name='Gates', slug='gates')
        p2 = Product.objects.create(brand=self.other, category=cat2, name='Swing', slug='swing', description='x', price=Decimal('100'))
        self.assertEqual(p1.slug, p2.slug)

    def test_in_stock_property(self):
        p = Product.objects.create(brand=self.tms, category=self.cat, name='A', slug='a', description='x', price=Decimal('1'), stock_quantity=0)
        self.assertFalse(p.in_stock)
        p.stock_quantity = 3
        p.save()
        self.assertTrue(p.in_stock)

    def test_option_value_price_modifier_defaults_zero(self):
        p = Product.objects.create(brand=self.tms, category=self.cat, name='Gate', slug='gate', description='x', price=Decimal('450'))
        opt = ProductOption.objects.create(product=p, name='Finish', option_type='color')
        val = ProductOptionValue.objects.create(option=opt, value='Gold', price_modifier=Decimal('50'))
        self.assertEqual(val.price_modifier, Decimal('50'))
        val2 = ProductOptionValue.objects.create(option=opt, value='Black')
        self.assertEqual(val2.price_modifier, Decimal('0'))
        self.assertEqual(list(p.options.first().values.all()), [val, val2])
```

- [ ] **Step 3: Run the tests to verify they pass against the migrated schema.**

Run:
```bash
source venv/bin/activate
pytest ecommerce/tests/test_models.py -v
```
Expected: all 5 tests PASS. (These exercise the constraints from Tasks 1-3; if `test_same_brand_cannot_duplicate_category_slug` fails, the `unique_together` from Task 3 was not applied.)

- [ ] **Step 4: Commit.**

```bash
git add ecommerce/tests/__init__.py ecommerce/tests/test_models.py
git commit -m "test(ecommerce): brand-scoped uniqueness and option pricing models"
```

---

## Task 5: `resolve_brand` helper

**Files:**
- Create: `ecommerce/brand_utils.py`
- Create: `ecommerce/tests/test_brand_utils.py`

- [ ] **Step 1: Write the failing helper test.**

Create `ecommerce/tests/test_brand_utils.py`:

```python
from django.test import TestCase
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIRequestFactory
from django.http import Http404
from brands.models import Brand
from ecommerce.brand_utils import resolve_brand


class ResolveBrandTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.tms = Brand.objects.create(name='The Metal Store', slug='themetalstore')

    def _drf_request(self, url):
        from rest_framework.request import Request
        return Request(self.factory.get(url))

    def test_resolves_existing_brand(self):
        req = self._drf_request('/x/?brand=themetalstore')
        self.assertEqual(resolve_brand(req), self.tms)

    def test_missing_param_raises_validation_error(self):
        req = self._drf_request('/x/')
        with self.assertRaises(ValidationError):
            resolve_brand(req)

    def test_unknown_brand_raises_404(self):
        req = self._drf_request('/x/?brand=nope')
        with self.assertRaises(Http404):
            resolve_brand(req)
```

- [ ] **Step 2: Run the test to verify it fails.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
pytest ecommerce/tests/test_brand_utils.py -v
```
Expected: FAIL with `ModuleNotFoundError: No module named 'ecommerce.brand_utils'`.

- [ ] **Step 3: Implement the helper.**

Create `ecommerce/brand_utils.py`:

```python
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from brands.models import Brand


def resolve_brand(request):
    """Resolve the Brand from the ?brand=<slug> query param.

    Raises ValidationError (400) if the param is missing, or Http404 if the
    slug does not match a brand.
    """
    slug = request.query_params.get('brand')
    if not slug:
        raise ValidationError({'error': 'brand query param is required'})
    return get_object_or_404(Brand, slug=slug)
```

- [ ] **Step 4: Run the test to verify it passes.**

Run:
```bash
pytest ecommerce/tests/test_brand_utils.py -v
```
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit.**

```bash
git add ecommerce/brand_utils.py ecommerce/tests/test_brand_utils.py
git commit -m "feat(ecommerce): add resolve_brand query-param helper"
```

---

## Task 6: Nested serializers for images and options + new fields

**Files:**
- Modify: `ecommerce/serializers.py`

- [ ] **Step 1: Add serializers for the new models and extend `ProductSerializer`.**

In `ecommerce/serializers.py`, update the import on line 2:
```python
from .models import (
    Category, Product, Cart, CartItem, Order, OrderItem, Coupon,
    ProductImage, ProductOption, ProductOptionValue,
)
```

Add these serializers **above** `class ProductSerializer` (after `CategorySerializer`, line 8):
```python
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order']


class ProductOptionValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOptionValue
        fields = ['id', 'value', 'price_modifier', 'sort_order']


class ProductOptionSerializer(serializers.ModelSerializer):
    values = ProductOptionValueSerializer(many=True, read_only=True)

    class Meta:
        model = ProductOption
        fields = ['id', 'name', 'option_type', 'sort_order', 'values']
```

Replace `ProductSerializer` (lines 11-17) with:
```python
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    in_stock = serializers.ReadOnlyField()
    images = ProductImageSerializer(many=True, read_only=True)
    options = ProductOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
```
(`fields = '__all__'` now also surfaces `brand`, `product_type`, `price_unit`, `has_3d`, `model_config`. Existing `category`, `category_name`, `image` field names are preserved for frontend compatibility.)

- [ ] **Step 2: Verify the module imports cleanly.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
python -c "import django; django.setup(); from ecommerce import serializers; print('ok', serializers.ProductSerializer().fields.keys())"
```
(If `django.setup()` needs settings: prefix with `DJANGO_SETTINGS_MODULE=config.settings`.)
Expected: prints `ok` and a key list including `images`, `options`, `product_type`, `price_unit`, `has_3d`, `model_config`.

- [ ] **Step 3: Commit.**

```bash
git add ecommerce/serializers.py
git commit -m "feat(ecommerce): nest images/options and expose new product fields in serializer"
```

---

## Task 7: Brand-scoped API filtering (the behavior tests)

**Files:**
- Modify: `ecommerce/views.py`
- Create: `ecommerce/tests/test_api.py`

- [ ] **Step 1: Write the failing API tests.**

Create `ecommerce/tests/test_api.py`:

```python
from decimal import Decimal
from rest_framework.test import APITestCase
from brands.models import Brand
from ecommerce.models import Category, Product, ProductOption, ProductOptionValue


class StoreAPITest(APITestCase):
    def setUp(self):
        self.tms = Brand.objects.create(name='The Metal Store', slug='themetalstore')
        self.other = Brand.objects.create(name='Marvel Homes', slug='marvel-homes')

        self.tms_cat = Category.objects.create(brand=self.tms, name='Gates', slug='gates')
        self.other_cat = Category.objects.create(brand=self.other, name='Doors', slug='doors')

        self.p_active = Product.objects.create(
            brand=self.tms, category=self.tms_cat, name='CNC Gate', slug='cnc-gate',
            description='x', price=Decimal('450'), is_active=True, has_3d=True,
            price_unit='/sqft', product_type='made_to_order',
        )
        opt = ProductOption.objects.create(product=self.p_active, name='Finish', option_type='color')
        ProductOptionValue.objects.create(option=opt, value='Gold', price_modifier=Decimal('50'))

        self.p_inactive = Product.objects.create(
            brand=self.tms, category=self.tms_cat, name='Hidden', slug='hidden',
            description='x', price=Decimal('10'), is_active=False,
        )
        self.p_other = Product.objects.create(
            brand=self.other, category=self.other_cat, name='Door', slug='door',
            description='x', price=Decimal('99'), is_active=True,
        )

    def _data(self, resp):
        body = resp.json()
        return body['data'] if isinstance(body, dict) and 'data' in body else body

    def test_products_require_brand_param(self):
        resp = self.client.get('/api/v1/store/products/')
        self.assertEqual(resp.status_code, 400)

    def test_products_filtered_by_brand_and_active(self):
        resp = self.client.get('/api/v1/store/products/?brand=themetalstore')
        self.assertEqual(resp.status_code, 200)
        slugs = {p['slug'] for p in self._data(resp)}
        self.assertEqual(slugs, {'cnc-gate'})  # active TMS only; not 'hidden', not 'door'

    def test_brand_isolation(self):
        resp = self.client.get('/api/v1/store/products/?brand=marvel-homes')
        slugs = {p['slug'] for p in self._data(resp)}
        self.assertEqual(slugs, {'door'})

    def test_detail_by_slug_includes_options_and_images(self):
        resp = self.client.get('/api/v1/store/products/cnc-gate/?brand=themetalstore')
        self.assertEqual(resp.status_code, 200)
        data = self._data(resp)
        self.assertEqual(data['slug'], 'cnc-gate')
        self.assertTrue(data['has_3d'])
        self.assertEqual(data['price_unit'], '/sqft')
        self.assertEqual(len(data['options']), 1)
        self.assertEqual(data['options'][0]['values'][0]['value'], 'Gold')

    def test_detail_wrong_brand_is_404(self):
        # 'cnc-gate' belongs to themetalstore, not marvel-homes
        resp = self.client.get('/api/v1/store/products/cnc-gate/?brand=marvel-homes')
        self.assertEqual(resp.status_code, 404)

    def test_categories_filtered_by_brand(self):
        resp = self.client.get('/api/v1/store/categories/?brand=themetalstore')
        self.assertEqual(resp.status_code, 200)
        slugs = {c['slug'] for c in self._data(resp)}
        self.assertEqual(slugs, {'gates'})

    def test_category_slug_filter(self):
        resp = self.client.get('/api/v1/store/products/?brand=themetalstore&category__slug=gates')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(self._data(resp)), 1)
```

- [ ] **Step 2: Run the tests to verify they fail.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
pytest ecommerce/tests/test_api.py -v
```
Expected: FAIL — e.g. `test_products_require_brand_param` returns 200 (no brand filter yet), `test_brand_isolation` returns both products.

- [ ] **Step 3: Add brand filtering to the viewsets.**

In `ecommerce/views.py`, add the import near the top (after line 5):
```python
from .brand_utils import resolve_brand
```

Replace `CategoryViewSet` (lines 12-16) with:
```python
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        brand = resolve_brand(self.request)
        return Category.objects.filter(brand=brand)
```

Replace `ProductViewSet.get_queryset` (lines 24-35) with:
```python
    def get_queryset(self):
        brand = resolve_brand(self.request)
        qs = (Product.objects
              .filter(brand=brand, is_active=True)
              .select_related('category')
              .prefetch_related('images', 'options__values'))
        category = self.request.query_params.get('category__slug')
        featured = self.request.query_params.get('is_featured')
        search = self.request.query_params.get('search')
        product_type = self.request.query_params.get('product_type')
        if category:
            qs = qs.filter(category__slug=category)
        if featured is not None:
            qs = qs.filter(is_featured=featured.lower() == 'true')
        if search:
            qs = qs.filter(name__icontains=search)
        if product_type:
            qs = qs.filter(product_type=product_type)
        return qs
```

NOTE: `ProductViewSet` already has `lookup_field = 'slug'` (line 22) and `CategoryViewSet` keeps the class-level `queryset` attribute so the DRF router can still infer the basename.

- [ ] **Step 4: Run the tests to verify they pass.**

Run:
```bash
pytest ecommerce/tests/test_api.py -v
```
Expected: all 7 tests PASS.

- [ ] **Step 5: Commit.**

```bash
git add ecommerce/views.py ecommerce/tests/test_api.py
git commit -m "feat(ecommerce): brand-scope store endpoints and filter active products"
```

---

## Task 8: Admin — brand columns and inlines

**Files:**
- Modify: `ecommerce/admin.py`

- [ ] **Step 1: Add inlines and brand to list_display/list_filter.**

In `ecommerce/admin.py`, update the import (line 2):
```python
from .models import (
    Category, Product, Cart, CartItem, Order, OrderItem, Coupon,
    ProductImage, ProductOption, ProductOptionValue,
)
```

Add these inline classes after `OrderItemInline` (after line 13):
```python
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductOptionValueInline(admin.TabularInline):
    model = ProductOptionValue
    extra = 1


class ProductOptionInline(admin.TabularInline):
    model = ProductOption
    extra = 0
    show_change_link = True
```

Replace `CategoryAdmin` (lines 16-19) and `ProductAdmin` (lines 22-27) with:
```python
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'slug']
    list_filter = ['brand']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'category', 'product_type', 'price', 'stock_quantity', 'is_active', 'is_featured']
    list_filter = ['brand', 'category', 'product_type', 'is_active', 'is_featured']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductOptionInline]


@admin.register(ProductOption)
class ProductOptionAdmin(admin.ModelAdmin):
    list_display = ['product', 'name', 'option_type', 'sort_order']
    inlines = [ProductOptionValueInline]
```

- [ ] **Step 2: Verify admin loads via system check.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
python manage.py check
```
Expected: `System check identified no issues`.

- [ ] **Step 3: Commit.**

```bash
git add ecommerce/admin.py
git commit -m "feat(ecommerce): admin brand columns, filters, and product inlines"
```

---

## Task 9: Rewrite the seed command (brand-scoped, rich, idempotent)

**Files:**
- Modify: `ecommerce/management/commands/seed_products.py`

- [ ] **Step 1: Replace the seed command with a brand-scoped, idempotent, richly-modeled version.**

Replace the entire contents of `ecommerce/management/commands/seed_products.py` with:

```python
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils.text import slugify
from brands.models import Brand
from ecommerce.models import Category, Product, ProductOption, ProductOptionValue
import requests

BRAND_SLUG = 'themetalstore'

PRODUCTS = [
    {
        "name": "Premium Swing Mechanism", "category": "Hardware", "price": 12500.00,
        "image": "https://themetalstore.in/service-swing.png", "product_type": "stock",
        "description": "Heavy duty bearing mechanism for smooth swing motion.", "is_featured": False,
        "stock_quantity": 25,
    },
    {
        "name": "Custom CNC Gate Design", "category": "Gates", "price": 450.00, "price_unit": "/sqft",
        "image": "https://themetalstore.in/service-gate.png", "product_type": "made_to_order",
        "description": "Bespoke gate designs tailored to your architectural style.", "is_featured": True,
        "has_3d": True, "model_config": {"type": "gate", "style": "classic"},
        "options": [
            {"name": "Finish", "option_type": "color",
             "values": [("Matte Black", 0), ("Gold", 80), ("Silver", 40)]},
            {"name": "Material", "option_type": "select",
             "values": [("Iron", 0), ("Steel", 60), ("Aluminum", 30)]},
        ],
    },
    {
        "name": "Modern Pergola Kit (10x10)", "category": "Gazebos", "price": 150000.00,
        "image": "https://themetalstore.in/hero-bg.png", "product_type": "stock",
        "description": "DIY friendly pergola kit with all necessary fixtures.", "is_featured": False,
        "stock_quantity": 8,
        "options": [
            {"name": "Roof Material", "option_type": "select",
             "values": [("Polycarbonate", 0), ("Glass", 25000), ("Louvered", 40000)]},
        ],
    },
    {
        "name": "Staircase Railing Consultation", "category": "Staircase", "price": 0.00, "price_unit": "Free",
        "image": "https://themetalstore.in/service-staircase.png", "product_type": "made_to_order",
        "description": "Expert consultation for your dream floating staircase.", "is_featured": False,
    },
    {
        "name": "Decorative Laser Cut Panel", "category": "Grills", "price": 3200.00,
        "image": "https://themetalstore.in/service-grills.png", "product_type": "stock",
        "description": "2x4 ft MS panel with powder coating.", "is_featured": False,
        "stock_quantity": 40,
    },
    {
        "name": "Modern Sliding Gate", "category": "Gates", "price": 85000.00,
        "image": "https://themetalstore.in/service-gate.png", "product_type": "stock",
        "description": "Minimalist sliding gate with automated motor compatibility.", "is_featured": True,
        "stock_quantity": 5,
    },
]


class Command(BaseCommand):
    help = 'Seeds The Metal Store catalog (brand-scoped, idempotent).'

    def handle(self, *args, **kwargs):
        try:
            brand = Brand.objects.get(slug=BRAND_SLUG)
        except Brand.DoesNotExist:
            self.stderr.write(self.style.ERROR(
                f"Brand '{BRAND_SLUG}' not found. Create it before seeding."
            ))
            return

        self.stdout.write('Seeding products for The Metal Store...')

        for item in PRODUCTS:
            item = dict(item)  # copy so reruns don't mutate the module-level list
            category_name = item.pop('category')
            image_url = item.pop('image', None)
            options = item.pop('options', [])

            category, _ = Category.objects.update_or_create(
                brand=brand, slug=slugify(category_name),
                defaults={'name': category_name},
            )

            product, created = Product.objects.update_or_create(
                brand=brand, slug=slugify(item['name']),
                defaults={
                    'category': category,
                    'name': item['name'],
                    'description': item['description'],
                    'price': item['price'],
                    'price_unit': item.get('price_unit', ''),
                    'product_type': item.get('product_type', 'stock'),
                    'is_featured': item.get('is_featured', False),
                    'stock_quantity': item.get('stock_quantity', 0),
                    'has_3d': item.get('has_3d', False),
                    'model_config': item.get('model_config'),
                },
            )

            # Replace options idempotently
            product.options.all().delete()
            for opt_i, opt in enumerate(options):
                option = ProductOption.objects.create(
                    product=product, name=opt['name'],
                    option_type=opt['option_type'], sort_order=opt_i,
                )
                for val_i, (val, modifier) in enumerate(opt['values']):
                    ProductOptionValue.objects.create(
                        option=option, value=val, price_modifier=modifier, sort_order=val_i,
                    )

            # Only fetch the primary image when the product has none yet (resilient)
            if image_url and not product.image:
                try:
                    response = requests.get(image_url, timeout=10)
                    if response.status_code == 200:
                        file_name = image_url.split('/')[-1]
                        product.image.save(file_name, ContentFile(response.content), save=True)
                        self.stdout.write(f'  Downloaded image for {product.name}')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(
                        f'  Skipped image for {product.name}: {e}'
                    ))

            verb = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{verb}: {product.name}'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded The Metal Store catalog'))
```

- [ ] **Step 2: Verify the command imports (system check).**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
python manage.py help seed_products
```
Expected: prints the command help with no import error.

- [ ] **Step 3: Commit.**

```bash
git add ecommerce/management/commands/seed_products.py
git commit -m "feat(ecommerce): brand-scoped idempotent seed with options and product types"
```

---

## Task 10: Seed tests — idempotency and brand attachment

**Files:**
- Create: `ecommerce/tests/test_seed.py`

- [ ] **Step 1: Write the failing seed tests.**

Create `ecommerce/tests/test_seed.py`:

```python
from io import StringIO
from unittest import mock
from django.test import TestCase
from django.core.management import call_command
from brands.models import Brand
from ecommerce.models import Product, Category, ProductOptionValue


class SeedProductsTest(TestCase):
    def setUp(self):
        self.tms = Brand.objects.create(name='The Metal Store', slug='themetalstore')

    def _run(self):
        # Avoid network calls during tests.
        with mock.patch('ecommerce.management.commands.seed_products.requests.get') as g:
            g.return_value.status_code = 404
            call_command('seed_products', stdout=StringIO(), stderr=StringIO())

    def test_seed_creates_brand_scoped_products(self):
        self._run()
        self.assertEqual(Product.objects.filter(brand=self.tms).count(), 6)
        self.assertTrue(Category.objects.filter(brand=self.tms, slug='gates').exists())
        gate = Product.objects.get(brand=self.tms, slug='custom-cnc-gate-design')
        self.assertTrue(gate.has_3d)
        self.assertEqual(gate.product_type, 'made_to_order')
        self.assertEqual(gate.options.count(), 2)

    def test_seed_is_idempotent(self):
        self._run()
        self._run()
        self.assertEqual(Product.objects.filter(brand=self.tms).count(), 6)
        # Options replaced, not duplicated: CNC gate has Finish(3) + Material(3) = 6 values.
        gate = Product.objects.get(brand=self.tms, slug='custom-cnc-gate-design')
        self.assertEqual(ProductOptionValue.objects.filter(option__product=gate).count(), 6)

    def test_seed_without_brand_is_safe(self):
        Brand.objects.all().delete()
        out, err = StringIO(), StringIO()
        with mock.patch('ecommerce.management.commands.seed_products.requests.get'):
            call_command('seed_products', stdout=out, stderr=err)
        self.assertEqual(Product.objects.count(), 0)
        self.assertIn('not found', err.getvalue())
```

- [ ] **Step 2: Run the tests to verify they pass.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
pytest ecommerce/tests/test_seed.py -v
```
Expected: all 3 tests PASS. (If `custom-cnc-gate-design` slug mismatch, confirm `slugify("Custom CNC Gate Design")` → `custom-cnc-gate-design`.)

- [ ] **Step 3: Commit.**

```bash
git add ecommerce/tests/test_seed.py
git commit -m "test(ecommerce): seed idempotency and brand-scoped attachment"
```

---

## Task 11: Full suite, coverage, and live seed run

**Files:** none (verification only)

- [ ] **Step 1: Run the full ecommerce test suite.**

Run:
```bash
cd /Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend && source venv/bin/activate
pytest ecommerce/ -v
```
Expected: all tests from Tasks 4, 5, 7, 10 PASS (18 tests total).

- [ ] **Step 2: Check coverage on the touched modules (project rule: 80%+).**

Run:
```bash
pytest ecommerce/ --cov=ecommerce --cov-report=term-missing
```
Expected: `ecommerce/views.py`, `ecommerce/serializers.py`, `ecommerce/brand_utils.py`, `ecommerce/models.py`, and the seed command at ≥80%. If `pytest-cov` is not installed, install it in the venv (`pip install pytest-cov`) or skip this step and note it.

- [ ] **Step 3: Seed the local DB and verify the endpoint end-to-end.**

Run (ensure a `themetalstore` Brand exists locally first; create via admin or shell if missing):
```bash
python manage.py shell -c "from brands.models import Brand; print(Brand.objects.filter(slug='themetalstore').values('id','name').first())"
python manage.py seed_products
python manage.py runserver 0.0.0.0:8000 &
sleep 4
curl -s "http://127.0.0.1:8000/api/v1/store/products/?brand=themetalstore" | head -c 600
curl -s "http://127.0.0.1:8000/api/v1/store/categories/?brand=themetalstore" | head -c 300
curl -s "http://127.0.0.1:8000/api/v1/store/products/custom-cnc-gate-design/?brand=themetalstore" | head -c 600
kill %1
```
Expected: products endpoint returns `{"success":true,"data":[... 6 products ...]}`; the detail call returns nested `options` with `values`. Categories returns the TMS categories.

- [ ] **Step 4: Final verification commit (if coverage config or pytest-cov was added).**

```bash
git add -A
git commit -m "chore(ecommerce): verify store foundation suite and coverage" || echo "nothing to commit"
```

---

## Done Criteria (maps to spec §8)

1. ✅ `GET /api/v1/store/products/?brand=themetalstore` returns the 6 seeded products with nested images/options (Task 7, Task 11 Step 3).
2. ✅ `GET /api/v1/store/categories/?brand=themetalstore` returns TMS categories (Task 7).
3. ✅ Detail-by-slug returns full customization data (Task 7 `test_detail_by_slug_includes_options_and_images`).
4. ✅ Brand isolation verified (Task 7 `test_brand_isolation`, `test_detail_wrong_brand_is_404`).
5. ✅ Admin can create a brand-scoped product with images + options (Task 8).
6. ✅ Tests pass; migrations apply cleanly on the live (empty) DB (Tasks 1-3, 11).

## Out of scope (roadmap — do NOT build here)
- BE-2 Razorpay/enquiry checkout; BE-3 customer auth/identity; FE-1/2/3 frontend changes. See spec §9.
