// Contact form. Posts JSON to the API Gateway endpoint that fronts the Lambda + SES
// mailer. The body shape is the Lambda's contract, so keep the field names as they are.
// No Content-Type header on purpose: text/plain keeps it a "simple" CORS request, so the
// browser doesn't send a preflight the endpoint was never set up for.

const ENDPOINT = "https://cw6u5cl22b.execute-api.us-east-2.amazonaws.com/default/SES-email-sending-func";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const submit = document.getElementById("submit");
const submitLabel = submit.firstChild.textContent;

const checks = {
  name: (v) => v.trim() !== "",
  email: (v) => EMAIL.test(v.trim()),
  message: (v) => v.trim() !== "",
};

function validate(input) {
  const check = checks[input.name];
  if (!check) return true;
  const ok = check(input.value);
  input.closest(".field").classList.toggle("is-invalid", !ok);
  input.setAttribute("aria-invalid", !ok);
  if (!ok) input.setAttribute("aria-describedby", `${input.name}-error`);
  else input.removeAttribute("aria-describedby");
  return ok;
}

for (const name of Object.keys(checks)) {
  const input = form.elements[name];
  input.addEventListener("blur", () => { if (input.value) validate(input); });
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("is-invalid")) validate(input);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const invalid = Object.keys(checks).map((n) => form.elements[n]).filter((input) => !validate(input));
  if (invalid.length) {
    invalid[0].focus();
    return;
  }

  submit.disabled = true;
  submit.firstChild.textContent = "Sending ";
  status.className = "form-status";
  status.textContent = "";

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        senderName: form.elements.name.value,
        senderEmail: form.elements.email.value,
        senderPhone: form.elements.phone.value,
        message: form.elements.message.value,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    form.reset();
    submit.firstChild.textContent = "Sent! ";
    status.classList.add("is-ok");
    status.textContent = "Thanks, I'll get back to you soon.";
  } catch (err) {
    console.error(err);
    submit.disabled = false;
    submit.firstChild.textContent = submitLabel;
    status.classList.add("is-error");
    status.innerHTML = 'Something broke on my end. I\'d love to debug it, so please <a href="mailto:david.gallo747@gmail.com">email me</a> what happened.';
  }
});
