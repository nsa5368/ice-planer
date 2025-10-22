/**
 * Copyright 2025 nsa5368
 * @license Apache-2.0, see LICENSE for full text.
 *
 * Unique version: Ice planning app with fee %, fixed fee, URL + localStorage sync,
 * responsive layout, DDD design system variables, dark mode polish.
 */

import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import "./number-input.js";

class UIPress extends DDDSuper(LitElement) {
  static get tag() { return "ui-press"; }

  static get properties() {
    return {
      tone: { type: String },
      size: { type: String },
      disabled: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.tone = "primary"; 
    this.size = "md";      
    this.disabled = false;
  }

  static get styles() {
    return [super.styles, css`
      :host { display: inline-block; }

      button {
        border: none;
        border-radius: var(--ddd-radius-sm);
        cursor: pointer;
        font-family: var(--ddd-font-navigation);
        font-weight: 700;
        letter-spacing: .4px;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .5rem;
        text-transform: uppercase;
      }

      button:disabled { opacity: .6; cursor: not-allowed; }

      /* sizes */
      .sm { padding: 6px 10px;  font-size: var(--ddd-font-size-xs); }
      .md { padding: 10px 16px; font-size: var(--ddd-font-size-s); }
      .lg { padding: 14px 22px; font-size: var(--ddd-font-size-m); }

      /* tones */
      .primary {
        background: var(--ddd-theme-primary, #4338ca);
        color: var(--ddd-theme-default-white, #fff);
      }
      .primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(67,56,202,.2); }

      .secondary {
        background: var(--ddd-theme-accent, #14b8a6);
        color: var(--ddd-theme-default-white, #fff);
      }
      .secondary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(20,184,166,.2); }

      .outline {
        background: transparent;
        color: var(--ddd-theme-primary, #4338ca);
        border: 2px solid var(--ddd-theme-primary, #4338ca);
      }
      .outline:hover:not(:disabled) { background: var(--ddd-theme-primary, #4338ca); color: #fff; }

      .ghost {
        background: transparent;
        color: var(--ddd-theme-primary, #4338ca);
        border: 1px solid transparent;
      }
      .ghost:hover:not(:disabled) { background: var(--ddd-theme-primary-light, #e0e7ff); }

      @media (prefers-color-scheme: dark) {
        .outline { color: #fff; border-color: #fff; }
        .outline:hover:not(:disabled) { background: #fff; color: #0f172a; }
        .ghost { color: #fff; }
        .ghost:hover:not(:disabled) { background: var(--ddd-theme-default-limestoneGray, #1e293b); }
      }
    `];
  }

  render() {
    return html`
      <button
        class="${this.tone} ${this.size}"
        ?disabled="${this.disabled}"
        @click="${(e) =>
          !this.disabled &&
          this.dispatchEvent(new CustomEvent('press', {
            detail: { originalEvent: e },
            bubbles: true,
            composed: true
          }))
        }"
      >
        <slot></slot>
      </button>
    `;
  }
}
customElements.define(UIPress.tag, UIPress);

export class IcePlanner extends DDDSuper(LitElement) {
  static get tag() { return "ice-planner"; }

  constructor() {
    super();
    // Defaults
    this.team = "Bandits";
    this.logo = "./hockey-logo.jpg";
    this.iceRate = 0;
    this.hours = 0;
    this.coach = 0;
    this.jersey = 0;
    this.players = 0;
    this.feePct = 0;
    this.feeFixed = 0;

    // Derived
    this.total = 0;
    this.perPlayer = 0;

    // Restore from URL or localStorage
    this._restoreState();

    // Initial compute
    this._recalc();
  }

  static get properties() {
    return {
      ...super.properties,
      team: { type: String },
      logo: { type: String },
      iceRate: { type: Number, attribute: "ice-rate" },
      hours: { type: Number },
      coach: { type: Number },
      jersey: { type: Number },
      players: { type: Number },
      feePct: { type: Number, attribute: "fee-pct" },
      feeFixed: { type: Number, attribute: "fee-fixed" },
      total: { type: Number },
      perPlayer: { type: Number, attribute: "per-player" },
    };
  }

  static get styles() {
    return [super.styles, css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background: var(--ddd-theme-default-white, #fff);
        font-family: var(--ddd-font-navigation);
      }

      .wrap { max-width: 1000px; margin: 0 auto; padding: var(--ddd-spacing-5); }

      .mast {
        padding: var(--ddd-spacing-4);
        background: linear-gradient(120deg, var(--ddd-theme-primary, #4338ca), var(--ddd-theme-accent, #14b8a6));
        color: #fff;
        border-radius: var(--ddd-radius-md);
        margin-bottom: var(--ddd-spacing-5);
      }

      .mast h2 { margin: 0; font-size: var(--ddd-font-size-xl); }

      .grid { display: grid; grid-template-columns: 1fr; gap: var(--ddd-spacing-5); }

      .panel {
        background: var(--ddd-theme-default-white, #fff);
        border: 1px solid var(--ddd-theme-default-limestoneLight, #e2e8f0);
        border-radius: var(--ddd-radius-md);
        padding: var(--ddd-spacing-4);
        box-shadow: 0 6px 22px rgba(0,0,0,.06);
      }

      .section-title {
        margin: 0 0 var(--ddd-spacing-3) 0;
        font-size: var(--ddd-font-size-l);
        font-weight: 800;
        color: var(--ddd-theme-primary);
      }

      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: #fff;
        border-left: 4px solid var(--ddd-theme-primary);
        border-radius: var(--ddd-radius-sm);
      }

      .row + .row { margin-top: 10px; }
      .label { font-weight: 700; }
      .value { font-weight: 800; color: var(--ddd-theme-primary-dark, #312e81); }

      .total {
        background: linear-gradient(135deg, var(--ddd-theme-primary), var(--ddd-theme-primary-dark));
        color: #fff;
        border-left-color: var(--ddd-theme-primary-dark, #312e81);
      }

      .controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .inputs   { display: grid; grid-template-columns: 1fr 1fr; gap: var(--ddd-spacing-3); }
      .stack    { display: flex; flex-direction: column; gap: 10px; }

      .sharebar { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }

      .team-input {
        width: 100%;
        padding: 12px 14px;
        border: 2px solid var(--ddd-theme-default-limestoneLight, #e2e8f0);
        border-radius: var(--ddd-radius-sm);
        font-family: var(--ddd-font-navigation);
        font-size: var(--ddd-font-size-m);
        font-weight: 600;
        color: var(--ddd-theme-primary);
        background: var(--ddd-theme-default-white, #fff);
        transition: all 0.2s ease;
        margin-bottom: var(--ddd-spacing-3);
      }

      .team-input:focus {
        border-color: var(--ddd-theme-primary, #4338ca);
        box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
        outline: none;
      }

      .team-label {
        font-weight: 700;
        font-size: var(--ddd-font-size-s);
        color: var(--ddd-theme-primary);
        letter-spacing: 0.3px;
        margin-bottom: 8px;
        display: block;
      }

      @media (max-width: 860px) {
        .grid   { grid-template-columns: 1fr; }
        .inputs { display: grid; grid-template-columns: 1fr 1fr; gap: var(--ddd-spacing-3); }
      }

      @media (prefers-color-scheme: dark) {
        :host  { background: var(--ddd-theme-default-limestoneGray, #1e293b); color: #e5e7eb; }
        .panel { background: var(--ddd-theme-default-coalyGray, #0f172a); border-color: #263044; box-shadow: 0 10px 26px rgba(0,0,0,.5); }
        .row   { background: #0f172a; }
        .value { color: var(--ddd-theme-default-limestoneLight, #94a3b8); }
        .team-label { color: #fff; }
        .team-input {
          background: var(--ddd-theme-default-coalyGray, #0f172a);
          border-color: var(--ddd-theme-default-limestoneGray, #1e293b);
          color: #e5e7eb;
        }
      }
    `];
  }

  /* =============== State – URL & localStorage sync =============== */
  _restoreState() {
    const params = new URLSearchParams(globalThis.location?.search || "");
    const getNum = (k, fallback) => {
      const s = params.get(k);
      if (s === null) return fallback;
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : fallback;
    };
    const getStr = (k, fallback) => (params.get(k) ?? fallback);

    // Try URL first
    const urlState = {
      team:    getStr("team", this.team),
      logo:    getStr("logo", this.logo),
      iceRate: getNum("ice", this.iceRate),
      hours:   getNum("hours", this.hours),
      coach:   getNum("coach", this.coach),
      jersey:  getNum("jersey", this.jersey),
      players: getNum("players", this.players),
      feePct:  getNum("fee", this.feePct),
      feeFixed:getNum("fixed", this.feeFixed),
    };

    // Fallback to localStorage if URL has nothing custom
    const hasCustomURL = [...params.keys()].length > 0;
    if (!hasCustomURL) {
      try {
        const raw = localStorage.getItem("ice-planner-state");
        if (raw) {
          const saved = JSON.parse(raw);
          Object.assign(this, saved);
        } else {
          Object.assign(this, urlState);
        }
      } catch {
        Object.assign(this, urlState);
      }
    } else {
      Object.assign(this, urlState);
    }
  }

  _writeState() {
    const state = {
      team: this.team,
      logo: this.logo,
      iceRate: this.iceRate,
      hours: this.hours,
      coach: this.coach,
      jersey: this.jersey,
      players: this.players,
      feePct: this.feePct,
      feeFixed: this.feeFixed,
    };

    try {
      localStorage.setItem("ice-planner-state", JSON.stringify(state));
    } catch {}

    const params = new URLSearchParams();
    params.set("team", this.team);
    if (this.logo) params.set("logo", this.logo);
    params.set("ice", String(this.iceRate));
    params.set("hours", String(this.hours));
    params.set("coach", String(this.coach));
    params.set("jersey", String(this.jersey));
    params.set("players", String(this.players));
    params.set("fee", String(this.feePct));
    params.set("fixed", String(this.feeFixed));

    const newURL = `${location.pathname}?${params.toString()}${location.hash || ""}`;
    history.replaceState(null, "", newURL);
  }

  /* ======================= Calculations ========================= */
  _recalc() {
    // Guard minimums
    if (this.players < 1) this.players = 0;
    if (this.hours < 0) this.hours = 0;

    const ice          = this.iceRate * this.hours;
    const jerseysTotal = this.jersey  * this.players;
    const base         = ice + this.coach + jerseysTotal;

    // Transaction fee = % of base + fixed
    const fee = base * (this.feePct / 100) + this.feeFixed;

    this.total     = base + fee;
    this.perPlayer = this.players > 0 ? this.total / this.players : 0;

    this._writeState();
  }

  updated(changed) {
    super.updated && super.updated(changed);
    if ([..."iceRate,hours,coach,jersey,players,feePct,feeFixed,team,logo".split(",")].some(p => changed.has(p))) {
      this._recalc();
    }
  }

  /* ======================= Handlers ============================= */
  _onInputNum(prop, e) {
    const v = parseFloat(e.detail?.value);
    if (!Number.isFinite(v)) return;
    this[prop] = v;
  }

  _onTeam(e) { this.team = e.target.value; }
  _onLogo(e) { this.logo = e.target.value; }

  _shareURL() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${this.team} Budget`, url })
        .catch(() => this._copyURL());
    } else {
      this._copyURL();
    }
  }

  _copyURL() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('URL copied to clipboard!');
    }).catch(() => {
      prompt('Copy this URL:', window.location.href);
    });
  }

  _resetAll() {
    this.team = "Bandits";
    this.logo = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Ice_hockey_pictogram.svg/640px-Ice_hockey_pictogram.svg.png";
    this.iceRate = 0;
    this.hours = 0;
    this.coach = 0;
    this.jersey = 0;
    this.players = 0;
    this.feePct = 2;
    this.feeFixed = 0.99;
    this._recalc();
  }

  /* ======================= Render =============================== */
  render() {
    const ice          = this.iceRate * this.hours;
    const jerseysTotal = this.jersey  * this.players;
    const base         = ice + this.coach + jerseysTotal;
    const feeShown     = base * (this.feePct / 100) + this.feeFixed;

    return html`
      <div class="wrap" part="container">
        <div class="mast" part="masthead">
          <h2>${this.team} — Ice Program Planner</h2>
          <div style="opacity:.9">
            Easily plan and manage your team's season expenses in one place.
          </div>
        </div>

        <div class="grid">
          <div class="panel" part="inputs">
            <div class="section-title">Inputs</div>
            
            <label class="team-label">Team Name</label>
            <input 
              type="text" 
              class="team-input"
              .value="${this.team}"
              @input="${this._onTeam}"
              placeholder="Enter team name"
              aria-label="Team name"
            />

            <div class="inputs">
              <mini-number
                label="Ice Cost (per Hour)"
                .value="${this.iceRate}"
                prefix="$"
                min="0"
                step="1"
                @value-changed="${(e) => this._onInputNum('iceRate', e)}"
              ></mini-number>

              <mini-number
                label="Number of Ice Slots (Hours)"
                .value="${this.hours}"
                suffix="hours"
                min="0"
                step="1"
                @value-changed="${(e) => this._onInputNum('hours', e)}"
              ></mini-number>

              <mini-number
                label="Coaches Cost (Total)"
                .value="${this.coach}"
                prefix="$"
                min="0"
                step="50"
                @value-changed="${(e) => this._onInputNum('coach', e)}"
              ></mini-number>

              <mini-number
                label="Jersey Cost (Per Player)"
                .value="${this.jersey}"
                prefix="$"
                min="0"
                step="1"
                @value-changed="${(e) => this._onInputNum('jersey', e)}"
              ></mini-number>

              <mini-number
                label="Number of Players"
                .value="${this.players}"
                min="0"
                step="1"
                @value-changed="${(e) => this._onInputNum('players', e)}"
              ></mini-number>

              <mini-number
                label="Transaction Fee (%)"
                .value="${this.feePct}"
                suffix="%"
                min="0"
                step="0.1"
                @value-changed="${(e) => this._onInputNum('feePct', e)}"
              ></mini-number>

              <mini-number
                label="Fixed Fee"
                .value="${this.feeFixed}"
                prefix="$"
                min="0"
                step="0.01"
                @value-changed="${(e) => this._onInputNum('feeFixed', e)}"
              ></mini-number>
            </div>

            <div class="sharebar">
              <ui-press @press="${this._resetAll}">Reset</ui-press>
              <ui-press tone="secondary" @press="${this._shareURL}">Share Budget</ui-press>
            </div>
          </div>

          <div class="panel" part="results">
            <div class="section-title">Cost Breakdown</div>

            <div class="row">
              <span class="label">Ice Time (${this.hours} × $${this.iceRate})</span>
              <span class="value">$${ice.toLocaleString()}</span>
            </div>

            <div class="row">
              <span class="label">Coaches</span>
              <span class="value">$${this.coach.toLocaleString()}</span>
            </div>

            <div class="row">
              <span class="label">Jerseys (${this.players} × $${this.jersey})</span>
              <span class="value">$${jerseysTotal.toLocaleString()}</span>
            </div>

            <div class="row">
              <span class="label">Transaction Fee (${this.feePct}% + $${this.feeFixed})</span>
              <span class="value">$${feeShown.toLocaleString()}</span>
            </div>

            <div class="row total" style="margin-top:10px;">
              <span class="label">Total Season Cost</span>
              <span class="value">$${this.total.toLocaleString()}</span>
            </div>

            <div class="row total">
              <span class="label">Cost per Player</span>
              <span class="value">$${Math.round(this.perPlayer).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url).href;
  }
}
customElements.define(IcePlanner.tag, IcePlanner);
