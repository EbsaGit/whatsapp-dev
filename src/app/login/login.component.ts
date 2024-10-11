import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('zohoAccessToken');
    if (token) {
      this.router.navigate(['/chats']);
    }
  }

  loginWithZoho() {
    const clientId = '1000.IPKDV3NR9Y1HJZ3RQA2K0IR97BS2JB';
    const redirectUri = 'http://localhost:4200/chats'; // Cambia la URL según tu app
    const scope = 'ZohoCRM.modules.ALL';  // Aquí defines el scope necesario
    const zohoAuthUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline`;
  
    window.location.href = zohoAuthUrl;  // Redirige a Zoho para iniciar sesión
  }
}