import {
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { SingletonService } from 'src/app/services/singleton.service';
import { UserService } from 'src/app/services/user.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBar: EventEmitter<any> = new EventEmitter();
  private subs = new SubSink();

  constructor(
    private user: UserService,
    private ss: SingletonService,
  ) {}
  isLogin: boolean = false;
  ngOnInit(): void {
    this.subs.sink = this.ss.isLogin$.subscribe((result) => {
      this.isLogin = result;
      console.log('this.isLogin', this.isLogin);
    });
  }

  toggleSidebar() {
    this.toggleSideBar.emit();
  }

  logout() {
    this.user.userLogout();
  }
  OnDesstroy() {
    this.subs.unsubscribe();
  }
}
