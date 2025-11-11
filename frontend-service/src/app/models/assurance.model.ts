export class Assurance {
  idAssurance?: number;
  nom: string = '';
  adresse: string = '';
  telephone: string = '';
  email: string = '';
  couverture: string = '';

  constructor(data?: any) {
    if (data) {
      this.idAssurance = data.idAssurance;
      this.nom = data.nom || '';
      this.adresse = data.adresse || '';
      this.telephone = data.telephone || '';
      this.email = data.email || '';
      this.couverture = data.couverture || '';
    }
  }
}
