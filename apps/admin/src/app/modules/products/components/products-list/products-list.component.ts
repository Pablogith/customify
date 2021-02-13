import { Component, OnInit } from '@angular/core';
import { IProduct } from '@customify/api-interfaces';
import { ProductService } from '../../../../core/services/product.service';
import { IResponse } from '../../../../shared/models/IResponse';

@Component({
  selector: 'customify-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

  public products: Array<IProduct>;
  public isLoaded = false;
  public pageHeaderData = { title: 'Products' };
  public productsTableData = {};

  constructor(private productService: ProductService) {
  }

  ngOnInit(): void {
    this.fetchAllProducts();
  }

  private fetchAllProducts(): void {
    this.productService.getAll<IResponse<Array<IProduct>>>()
      .subscribe((products: IResponse<Array<IProduct>>) => {
        this.checkProducts(products.data);
        this.products = products.data;
        this.setProductsTableData();
      });
  }

  private checkProducts(product: Array<IProduct>): void {
    this.isLoaded = !(!product || product.length === 0);
  }

  private setProductsTableData(): void {
    this.productsTableData = {
      columns: this.getAllProductKeys(),
      body: this.products
    };
  }

  private getAllProductKeys(): Array<string> {
    return Object.keys(this.products[0]);
  }

}
