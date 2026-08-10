// Gemeinsame Umrechner-Engine für alle Einheitenrechner-Seiten (DE/NL/FR).
const LOCALE_BY_LANG = { de: 'de-DE', nl: 'nl-NL', fr: 'fr-FR' };
const INVALID_NUMBER_MSG = {
  de: 'Bitte einen gültigen Zahlenwert eingeben.',
  nl: 'Voer een geldige numerieke waarde in.',
  fr: 'Veuillez saisir une valeur numérique valide.'
};

function formatNumber(num, maxFractionDigits = 10) {
  if (!Number.isFinite(num)) return '';
  const locale = LOCALE_BY_LANG[document.documentElement.lang] || 'de-DE';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits }).format(num);
}

// units: { key: { label, ...beliebige Umrechnungsdaten } }
// convert(value, fromUnit, toUnit): liefert die umgerechnete Zahl
function createConverter({
  units,
  convert: convertFn,
  defaultFrom,
  defaultTo,
  decimals = 10,
  ids = {}
}) {
  const {
    fromValueId = 'fromValue',
    toValueId = 'toValue',
    fromUnitId = 'fromUnit',
    toUnitId = 'toUnit',
    resultId = 'resultText',
    swapId = 'swapBtn'
  } = ids;

  const fromValue = document.getElementById(fromValueId);
  const toValue = document.getElementById(toValueId);
  const fromUnit = document.getElementById(fromUnitId);
  const toUnit = document.getElementById(toUnitId);
  const resultText = document.getElementById(resultId);
  const swapBtn = document.getElementById(swapId);

  function populate() {
    Object.entries(units).forEach(([key, unit]) => {
      fromUnit.add(new Option(unit.label, key));
      toUnit.add(new Option(unit.label, key));
    });
    fromUnit.value = defaultFrom;
    toUnit.value = defaultTo;
  }

  function convert() {
    const value = parseFloat(fromValue.value);
    if (Number.isNaN(value)) {
      toValue.value = '';
      if (resultText) resultText.textContent = INVALID_NUMBER_MSG[document.documentElement.lang] || INVALID_NUMBER_MSG.de;
      return;
    }
    const from = units[fromUnit.value];
    const to = units[toUnit.value];
    const result = convertFn(value, from, to);
    toValue.value = formatNumber(result, decimals);
    if (resultText) {
      resultText.textContent = `${formatNumber(value, decimals)} ${from.label} = ${formatNumber(result, decimals)} ${to.label}`;
    }
  }

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const a = fromUnit.value;
      fromUnit.value = toUnit.value;
      toUnit.value = a;
      convert();
    });
  }

  [fromValue, fromUnit, toUnit].forEach(el => el.addEventListener('input', convert));

  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [from, to, value] = btn.dataset.preset.split(',');
      fromUnit.value = from;
      toUnit.value = to;
      fromValue.value = value;
      convert();
    });
  });

  populate();
  convert();
}

// Umrechnungsfunktion für Einheiten mit einfachem linearem Faktor (Basis = 1).
function linearConvert(value, from, to) {
  return (value * from.factor) / to.factor;
}
