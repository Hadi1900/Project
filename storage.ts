import { users, type User, type InsertUser, favorites, type Favorite, type InsertFavorite, type MovieRecommendation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, movieId: number): Promise<boolean>;
  getFavorites(userId: number): Promise<Favorite[]>;
  isFavorite(userId: number, movieId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private favorites: Map<number, Favorite>;
  private userIdCount: number;
  private favoriteIdCount: number;

  constructor() {
    this.users = new Map();
    this.favorites = new Map();
    this.userIdCount = 1;
    this.favoriteIdCount = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCount++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCount++;
    const favorite: Favorite = { ...insertFavorite, id };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, movieId: number): Promise<boolean> {
    const favoriteEntry = Array.from(this.favorites.entries()).find(
      ([_, favorite]) => favorite.userId === userId && favorite.movieId === movieId
    );
    
    if (favoriteEntry) {
      this.favorites.delete(favoriteEntry[0]);
      return true;
    }
    
    return false;
  }

  async getFavorites(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }

  async isFavorite(userId: number, movieId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      (favorite) => favorite.userId === userId && favorite.movieId === movieId
    );
  }
}

export const storage = new MemStorage();
