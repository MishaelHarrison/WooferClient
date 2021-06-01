import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Post } from './post';
import { User } from './user';

/**
 * makes all api calls for posts
 */
@Injectable({
  providedIn: 'root',
})
export class PostService {
  /**
   * url for makeing post calls
   */
  private url: string;
  /**
   * @param http injected http client
   */
  constructor(private http: HttpClient) {
    this.url = 'http://ec2-3-141-152-217.us-east-2.compute.amazonaws.com/post';
  }

  /**
   * retrieves all of the posts
   * @returns observable that retrieves a list of all posts upon completion
   */
  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.url}s`);
  }

  /**
   * retrieves all of the posts by username
   * @returns observable that retrieves a list of posts upon completion
   */
  getByUsername(username: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.url}s/user/${username}`).pipe(
      tap((results) => {
        results.reverse();
      })
    );
  }

  /**
   * retrieves a post by the post id
   * @param postId the id of the post
   * @returns the post with the matching id
   */
  getById(postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.url}/${postId}`);
  }

  /**
   * adds a post to the database
   * @param body body of the post
   * @returns observable that returns nothing upon completion
   */
  post(body: string): Observable<Post> {
    const user: User = JSON.parse(localStorage.getItem('user'));
    if (user) {
      return this.http.post<Post>(this.url, {
        body: `${body}`,
        userId: Number(user.id),
      });
    } else {
      alert('there is no logged user');
      return new Observable<Post>((o) => o.next(null));
    }
  }

  remPost(id: number): Observable<void> {
    return this.http.delete<void>(this.url + '/' + id);
  }

  /**
   * likes a post
   * @param postId id of post to like
   * @returns observable that returns the number of total likes for relevent post upon completion
   */
  like(postId: number): Observable<number> {
    return this.http.post<number>(
      `http://ec2-3-141-152-217.us-east-2.compute.amazonaws.com/like/${
        JSON.parse(localStorage.getItem('user')).id
      }/${postId}`,
      null
    );
  }

  /**
   * unlikes a post
   * @param postId id of post to unlike
   * @returns observable that returns the number of total likes for relevent post upon completion
   */
  unLike(postId: number): Observable<number> {
    return this.http.delete<number>(
      `http://ec2-3-141-152-217.us-east-2.compute.amazonaws.com/like/${
        JSON.parse(localStorage.getItem('user')).id
      }/${postId}`
    );
  }

  refreshLikes(): Observable<void> {
    return new Observable<void>((o) => {
      this.http
        .get<number[]>(
          'http://ec2-3-141-152-217.us-east-2.compute.amazonaws.com/like/' +
            JSON.parse(localStorage.getItem('user')).id
        )
        .subscribe((likes) => {
          localStorage.setItem('likes', JSON.stringify(likes));
          o.next();
        });
    });
  }
}
