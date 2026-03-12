import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FirebaseStorageService {
    private storage = inject(Storage);

    uploadProfileImage(userId: string, file: File): Observable<string> {
        const filePath = `profile_images/${userId}/${file.name}`;
        const storageRef = ref(this.storage, filePath);

        return from(uploadBytes(storageRef, file)).pipe(
            switchMap(() => from(getDownloadURL(storageRef)))
        );
    }
}
