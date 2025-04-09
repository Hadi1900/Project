import { users, type User, type InsertUser, favorites, type Favorite, type InsertFavorite, type MovieRecommendation } from "@shared/schema";

export interface WatchLater {
  id: number;
  userId: number;
  movieId: number;
  movieData: string; // JSON string of movie data
  addedAt: Date;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Favorites
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, movieId: number): Promise<boolean>;
  getFavorites(userId: number): Promise<Favorite[]>;
  isFavorite(userId: number, movieId: number): Promise<boolean>;
  
  // Watch Later
  addToWatchLater(userId: number, movieId: number, movieData: string): Promise<WatchLater>;
  removeFromWatchLater(userId: number, movieId: number): Promise<boolean>;
  getWatchLater(userId: number): Promise<WatchLater[]>;
  isInWatchLater(userId: number, movieId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private favorites: Map<number, Favorite>;
  private watchLater: Map<number, WatchLater>;
  private userIdCount: number;
  private favoriteIdCount: number;
  private watchLaterIdCount: number;

  constructor() {
    this.users = new Map();
    this.favorites = new Map();
    this.watchLater = new Map();
    this.userIdCount = 1;
    this.favoriteIdCount = 1;
    this.watchLaterIdCount = 1;
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
  
  async addToWatchLater(userId: number, movieId: number, movieData: string): Promise<WatchLater> {
    const id = this.watchLaterIdCount++;
    
    const watchLaterItem: WatchLater = {
      id,
      userId,
      movieId,
      movieData,
      addedAt: new Date()
    };
    
    this.watchLater.set(id, watchLaterItem);
    return watchLaterItem;
  }
  
  async removeFromWatchLater(userId: number, movieId: number): Promise<boolean> {
    const watchLaterEntry = Array.from(this.watchLater.entries()).find(
      ([_, item]) => item.userId === userId && item.movieId === movieId
    );
    
    if (watchLaterEntry) {
      this.watchLater.delete(watchLaterEntry[0]);
      return true;
    }
    
    return false;
  }
  
  async getWatchLater(userId: number): Promise<WatchLater[]> {
    return Array.from(this.watchLater.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()); // Most recent first
  }
  
  async isInWatchLater(userId: number, movieId: number): Promise<boolean> {
    return Array.from(this.watchLater.values()).some(
      (item) => item.userId === userId && item.movieId === movieId
    );
  }
}

export const storage = new MemStorage();
