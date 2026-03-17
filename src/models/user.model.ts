export interface User {
  id?: number;
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
  entreprise?: string;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreate extends Omit<User, 'id' | 'created_at' | 'updated_at'> {}
export interface UserLogin {
  email: string;
  password: string;
}
