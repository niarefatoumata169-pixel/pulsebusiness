export interface BaseModel {
  id?: number;
  user_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BaseCreate extends Omit<BaseModel, 'id' | 'created_at' | 'updated_at'> {}
export interface BaseUpdate extends Partial<Omit<BaseModel, 'id'>> {}
