/**
 * Copyright 2025 nsa5368
 * @license Apache-2.0, see LICENSE for full text.
 */

import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";


export class MiniNumber extends DDDSuper(LitElement) {
  static get tag() {
    return "mini-number";
  }

  static get properties() {
    return {
      label: { type: String },
      value: { type: Number },
      min: { type: Number },
      max: { type: Number },
      step: { type: Number },
      prefix: { type: String },
      suffix: { type: String },
      name: { type: String },
      required: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true }
    };
  }

  constructor() {
    super();
    this.label = "";
    this.value = 0;
    this.min = -Infinity;
    this.max = Infinity;
    this.step = 1;
    this.prefix = "";
    this.suffix = "";
    this.name = "";
    this.required = false;
    this.disabled = false;
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          margin: var(--ddd-spacing-2) 0;
        }

        .wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-weight: 700;
          font-size: var(--ddd-font-size-s);
          color: var(--ddd-theme-primary);
          letter-spacing: 0.3px;
        }

        .box {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 2px solid var(--ddd-theme-default-limestoneLight, #e2e8f0);
          border-radius: var(--ddd-radius-sm);
          padding: 12px 14px;
          background: var(--ddd-theme-default-white, #fff);
          transition: all 0.2s ease;
        }

        .box:focus-within {
          border-color: var(--ddd-theme-primary, #4338ca);
          box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
        }

        :host([disabled]) .box {
          background: var(--ddd-theme-default-limestoneLight, #f8f9fa);
          opacity: 0.7;
        }

        .adorn {
          opacity: 0.7;
          font-size: var(--ddd-font-size-s);
          font-weight: 600;
          color: var(--ddd-theme-primary);
        }

        input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--ddd-font-navigation);
          font-size: var(--ddd-font-size-m);
          font-weight: 600;
          text-align: right;
          color: var(--ddd-theme-primary);
        }

        input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

        @media (prefers-color-scheme: dark) {
          label {
            color: #fff;
          }

          .box {
            background: var(--ddd-theme-default-coalyGray, #0f172a);
            border-color: var(--ddd-theme-default-limestoneGray, #1e293b);
            color: #e5e7eb;
          }

          input {
            color: #e5e7eb;
          }

          .adorn {
            color: var(--ddd-theme-default-limestoneLight, #94a3b8);
          }

          :host([disabled]) .box {
            background: var(--ddd-theme-default-limestoneGray, #1e293b);
          }
        }
      `
    ];
  }

  _clamp(n) {
    if (Number.isNaN(n)) n = 0;
    if (n < this.min) n = this.min;
    if (n > this.max) n = this.max;
    return n;
  }

  _onInput(e) {
    const v = this._clamp(parseFloat(e.target.value));
    this.value = v;
    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: v },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    const id =
      this.name ||
      this.label?.toLowerCase().replace(/\s+/g, "-") ||
      "num";

    return html`
      <div class="wrap">
        ${this.label
          ? html`<label for="${id}"
              >${this.label}${this.required
                ? html` <span aria-hidden="true">*</span>`
                : ""}</label
            >`
          : ""}
        <div class="box">
          ${this.prefix
            ? html`<span class="adorn">${this.prefix}</span>`
            : ""}
          <input
            id="${id}"
            name="${id}"
            type="number"
            .value="${Number(this.value ?? 0)}"
            .min="${Number.isFinite(this.min) ? this.min : ""}"
            .max="${Number.isFinite(this.max) ? this.max : ""}"
            .step="${this.step}"
            inputmode="decimal"
            @input="${this._onInput}"
            aria-label="${this.label || this.name || "number"}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
          />
          ${this.suffix
            ? html`<span class="adorn">${this.suffix}</span>`
            : ""}
        </div>
      </div>
    `;
  }
}

customElements.define(MiniNumber.tag, MiniNumber);
