import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss']
})
export class AddToCartComponent implements OnInit{

  item:any;

  constructor(private router:ActivatedRoute ) { }

  ngOnInit(): void {
    this.item = this.router.snapshot.root.firstChild?.data;
    const passedData = this.router.snapshot.root.firstChild?.data?.['data'];
    if (passedData) {
      console.log('####',this.router.snapshot.root.firstChild?.data)
      // Use 'passedData' in your component
    } else {
      // Handle the case when data is not found
    }
  }

}
