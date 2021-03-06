import { Component, OnInit } from '@angular/core';
import { IProduct } from '@customify/api-interfaces';
import { ErrorService, ProductService } from '@customify/data-access';
import { IResponse } from '../../../../shared/models/IResponse';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

type CreateProductResponse = IResponse<Array<IProduct>> | IProduct | HttpErrorResponse;

@Component({
  selector: 'customify-products-list',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit {

  public isLoaded = false;
  public formIsVisible = false;

  public columnNames: Array<string> = [ 'id', 'name', 'price' ];
  public productAllAvailableKeys: Array<string> = ['name', 'price', 'description'];
  public products: Array<IProduct>;
  public productsTableData = {};

  public pageHeaderData = { title: 'Products' };

  public response: CreateProductResponse;
  public error: HttpErrorResponse;
  public errorMessageForUser: string;

  constructor(private productService: ProductService,
              private errorService: ErrorService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.fetchAllProducts();
    this.errorService.error$.subscribe(error => {
      this.error = error;
      console.log(error);
    });
  }

  public showCreateProductForm(): void {
    this.formIsVisible = true;
  }

  public hideCreateProductForm(event?: unknown): void {
    this.formIsVisible = false;
  }

  public deleteProduct(event: number): void {
    this.productService.delete(event).subscribe((response) => {
      if (response['success']) {
        this.products.splice(0, this.products.length);
        this.isLoaded = false;
        this.fetchAllProducts();
      }
    });
  }

  public handleCreateProductSubmit(event: FormGroup): void {
    const product: IProduct = event.value;
    this.productService.add<IProduct>(product).subscribe((response: CreateProductResponse) => {
      console.log(response);
      this.response = response;
      if (this.response['success']) {
        this.handleSuccessResponse();
        this.products.push(response['data']);
      }
    });
  }

  public async getFullProductInfoPage(event: unknown): Promise<void> {
    this.productService.getById<IResponse<IProduct>>(Number(event)).subscribe((response: IResponse<IProduct>) => {
      if (!response.success) {
        this.errorService.error$.subscribe((error) => {
          console.log(error);
        });
      }
      this.redirectToProductDetailsPage(Number(response.data['id']))
    });
  }

  public changeProductKeysToDisplayInTable(event: Array<string>): void {
    this.productAllAvailableKeys = event;
  }

  private async redirectToProductDetailsPage(id: number): Promise<void> {
    await this.router.navigate([ 'products', id ]);
  }

  private fetchAllProducts(): void {
    this.productService.getAll<IResponse<Array<IProduct>>>()
      .subscribe((products: IResponse<Array<IProduct>>) => {
        this.checkLoadingOfProducts(products.data);
        this.products = products.data;
        this.setProductsTableData();
        this.isLoaded = true;
      });
  }

  private checkLoadingOfProducts(products: Array<IProduct>): void {
    this.isLoaded = !(!products || products.length === 0);
  }

  private setProductsTableData(): void {
    this.productsTableData = {
      columns: this.getProductKeys(),
      body: this.products
    };
  }

  private getProductKeys(): Array<string> {
    return Object.keys(this.products[0]);
  }

  private handleSuccessResponse(): void {
    this.fetchAllProducts();
    this.hideCreateProductForm();
  }

}
