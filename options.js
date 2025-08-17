const SKEY = "yt_autoreplay_settings";
const $ = sel => document.querySelector(sel);

const load = () => new Promise(res => {
  chrome.storage.sync.get(
    { [SKEY]: { enabled: true, mode: "loop", delayMs: 0 } },
    v => res(v[SKEY])
  );
});

const save = (cfg) => new Promise(res => {
  chrome.storage.sync.set({ [SKEY]: cfg }, res);
});

const toggleDelay = () => {
  const mode = document.querySelector('input[name="mode"]:checked')?.value || "loop";
  $("#delaySec").style.display = (mode === "refresh") ? "block" : "none";
};

document.addEventListener("DOMContentLoaded", async () => {
  const cfg = await load();

  $("#enabled").checked = !!cfg.enabled;
  document.querySelectorAll('input[name="mode"]').forEach(r => {
    r.checked = (r.value === cfg.mode);
  });
  $("#delayMs").value = cfg.delayMs || 0;
  toggleDelay();

  $("#enabled").addEventListener("change", async () => {
    cfg.enabled = $("#enabled").checked;
    await save(cfg);
  });

  document.querySelectorAll('input[name="mode"]').forEach(r => {
    r.addEventListener("change", async () => {
      cfg.mode = r.value;
      await save(cfg);
      toggleDelay();
    });
  });

  $("#delayMs").addEventListener("input", async () => {
    cfg.delayMs = Math.max(0, parseInt($("#delayMs").value || "0", 10));
    await save(cfg);
  });
});
