import WebApp from "@twa-dev/sdk";

// Attempts to open the phone dialer on mobile devices using a tel: link.
// If the environment doesn't look like a mobile device, or opening the
// dialer isn't appropriate, falls back to copying the number to clipboard
// and notifying the user.
export async function callOrCopyPhone(phone: string) {
  if (!phone) return;

  const tel = `tel:${phone}`;

  // Basic mobile detection
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  try {
    if (isMobile) {
      // Try to open dialer
      // Using location.href is the most compatible way to trigger dialer
      window.location.href = tel;
      return;
    }

    // On non-mobile, copy to clipboard as a friendly fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(phone);
      WebApp.showAlert("Phone number copied to clipboard");
      return;
    }

    // If clipboard API isn't available, fall back to prompt so user can copy
    // (this is last resort)
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Can't open dialer on this device. Copy number ${phone} to clipboard?`
    );
    if (confirmed) {
      try {
        await navigator.clipboard.writeText(phone);
        WebApp.showAlert("Phone number copied to clipboard");
      } catch (e) {
        // As a last resort, show the number in an alert so user can manually copy
        WebApp.showAlert(`Phone: ${phone}`);
      }
    }
  } catch (err) {
    console.error("callOrCopyPhone error:", err);
    try {
      await navigator.clipboard.writeText(phone);
      WebApp.showAlert("Phone number copied to clipboard");
    } catch (e) {
      WebApp.showAlert(`Phone: ${phone}`);
    }
  }
}
