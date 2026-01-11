from django.http import HttpResponse
from .models import Product
from django.utils.html import strip_tags

def google_merchant_feed(request):
    products = Product.objects.all()
    xml = ['<?xml version="1.0"?>']
    xml.append('<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">')
    xml.append('<channel>')
    xml.append('<title>The Metal Store</title>')
    xml.append('<link>https://themetal.store</link>')
    xml.append('<description>Custom Gates, Gazebos, and Metal Fabrication</description>')

    for product in products:
        xml.append('<item>')
        xml.append(f'<g:id>{product.id}</g:id>')
        xml.append(f'<g:title>{product.name}</g:title>')
        xml.append(f'<g:description>{strip_tags(product.description)}</g:description>')
        # Assuming frontend URL structure
        xml.append(f'<link>https://themetal.store/store/{product.slug}</link>') 
        if product.image:
             # Assuming valid absolute URL or needs request.build_absolute_uri
            image_url = request.build_absolute_uri(product.image.url)
            xml.append(f'<g:image_link>{image_url}</g:image_link>')
        
        xml.append(f'<g:price>{product.price} INR</g:price>')
        xml.append('<g:availability>in stock</g:availability>')
        xml.append('<g:condition>new</g:condition>')
        xml.append('</item>')

    xml.append('</channel>')
    xml.append('</rss>')

    return HttpResponse('\n'.join(xml), content_type='application/xml')
