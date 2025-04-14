document.querySelectorAll('.edit-user-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const btn = button as HTMLButtonElement;
    const userId = btn.dataset.userId;
    if (!userId) return;

    try {
      const res = await fetch(`/api/users/${userId}`);
      const user = await res.json();

      const userIdInput = document.getElementById('userId') as HTMLInputElement;
      const firstNameInput = document.getElementById('firstName') as HTMLInputElement;
      const lastNameInput = document.getElementById('LastName') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('Password') as HTMLInputElement;
      const aboutInput = document.getElementById('About') as HTMLInputElement;
      const modal = document.getElementById('edit-user-modal');

      if (
        userIdInput && firstNameInput && lastNameInput &&
        emailInput && passwordInput && aboutInput && modal
      ) {
        userIdInput.value = user._id;
        firstNameInput.value = user.firstName;
        lastNameInput.value = user.lastName;
        emailInput.value = user.email;
        passwordInput.value = user.password || '';
        aboutInput.value = user.about || '';
        modal.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  });
});
