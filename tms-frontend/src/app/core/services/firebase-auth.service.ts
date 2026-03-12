import { Injectable, inject } from '@angular/core';
import { Auth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthService {
    private auth = inject(Auth);

    sendVerificationLink(email: string): Observable<void> {
        const actionCodeSettings = {
            url: window.location.origin + '/register',
            handleCodeInApp: true
        };
        return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings));
    }

    async completeRegistration(email: string, password: string, name: string) {
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        return userCredential.user;
    }
}
