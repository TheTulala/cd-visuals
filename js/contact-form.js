/* Project inquiry form: accessible validation + Web3Forms delivery */
(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  const thankyou = document.getElementById("contact-thankyou");
  if (!form || !thankyou) {
    return;
  }

  const status = form.querySelector(".form-status");
  const submit = form.querySelector('[type="submit"]');
  const required = Array.prototype.slice.call(form.querySelectorAll("[required]"));

  const messages = {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    message: "Tell us a little about your project."
  };

  function errorEl(field) {
    return document.getElementById(field.id + "-error");
  }

  function showError(field) {
    const el = errorEl(field);
    field.setAttribute("aria-invalid", "true");
    if (el) {
      el.textContent = messages[field.name] || "This field is required.";
      el.classList.add("is-visible");
    }
  }

  function clearError(field) {
    const el = errorEl(field);
    field.removeAttribute("aria-invalid");
    if (el) {
      el.textContent = "";
      el.classList.remove("is-visible");
    }
  }

  required.forEach(function (field) {
    field.addEventListener("input", function () {
      if (field.checkValidity()) {
        clearError(field);
      }
    });
  });

  function showFailure() {
    status.innerHTML =
      'Sorry, your message didn\'t go through. Please call <a href="tel:+15857943225">585&#8209;794&#8209;3225</a> or email <a href="mailto:chrisdoddbr@gmail.com">chrisdoddbr@gmail.com</a>.';
    submit.disabled = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.textContent = "";

    const invalid = required.filter(function (field) {
      return !field.checkValidity();
    });
    required.forEach(clearError);

    if (invalid.length) {
      invalid.forEach(showError);
      invalid[0].focus();
      return;
    }

    submit.disabled = true;

    fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
      signal: window.AbortSignal.timeout(15000)
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (!response.ok || data.success === false) {
              throw new Error("Submission failed");
            }
          });
      })
      .then(function () {
        form.hidden = true;
        thankyou.hidden = false;
        thankyou.focus();
      })
      .catch(showFailure);
  });
})();
