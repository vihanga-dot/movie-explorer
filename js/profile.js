import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Firebase config (same as in auth.js)
const firebaseConfig = {
  apiKey: "AIzaSyCcR2FctbSYs07U958JgAtXX28Q6dE_w58",
  authDomain: "movieexplorer-a962a.firebaseapp.com",
  projectId: "movieexplorer-a962a",
  storageBucket: "movieexplorer-a962a.firebasestorage.app",
  messagingSenderId: "26461702551",
  appId: "1:26461702551:web:884a5e6c90820cb4265cd2",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profile-form');
  const profilePictureInput = document.getElementById('profile-picture-input');
  const profilePicturePreview = document.getElementById('profile-picture-preview');

  const userUid = localStorage.getItem('userUid');

  if (!userUid) {
    // Handle case where user is not logged in
    alert("You must be logged in to view your profile.");
    window.location.href = 'login.html';
    return;
  }

  const profileDocRef = doc(db, "profiles", userUid);

  // Load user data from Firestore
  const loadProfile = async () => {
    const docSnap = await getDoc(profileDocRef);

    if (docSnap.exists()) {
      const profile = docSnap.data();
      document.getElementById('bio').value = profile.bio || '';
      document.getElementById('skills').value = profile.skills ? profile.skills.join(', ') : '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('phone').value = profile.phone || '';
      if (profile.picture) {
        profilePicturePreview.src = profile.picture;
      }
    } else {
      console.log("No such document!");
    }
  };

  // Handle profile picture selection
  profilePictureInput.addEventListener('change', () => {
    const file = profilePictureInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePicturePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle form submission
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(profileForm);
    const profile = {
      bio: formData.get('bio'),
      skills: formData.get('skills').split(',').map(skill => skill.trim()),
      email: formData.get('email'),
      phone: formData.get('phone'),
      picture: profilePicturePreview.src
    };

    try {
      await setDoc(profileDocRef, profile, { merge: true });
      alert('Profile saved successfully!');
    } catch (error) {
      console.error("Error writing document: ", error);
      alert('Error saving profile.');
    }
  });

  loadProfile();
});