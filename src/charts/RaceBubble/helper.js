import * as d3 from 'd3';

function disposal(element) {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      const target = element.closest(".observablehq");
      if (!target) return resolve();
      const observer = new MutationObserver(mutations => {
        if (target.contains(element)) return;
        observer.disconnect();
        resolve();
      });
      observer.observe(target, {childList: true});
    });
  });
}

function Scrubber(values, {
  format = value => value,
  initial = 0,
  delay = null,
  autoplay = true,
  loop = true,
  alternate = false
} = {}) {
  values = Array.from(values);
  const form = `<form style="font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; display: flex; height: 33px; align-items: center;">
  <button name=b type=button style="margin-right: 0.4em; width: 5em;"></button>
  <label style="display: flex; align-items: center;">
    <input name=i type=range min=0 max=${values.length - 1} value=${initial} step=1 style="width: 180px;">
    <output name=o style="margin-left: 0.4em;"></output>
  </label>
</form>`;
  let timer = null;
  let direction = 1;
  function start() {
    form.b.textContent = "Pause";
    timer = delay === null
      ? requestAnimationFrame(tick)
      : setInterval(tick, delay);
  }
  function stop() {
    form.b.textContent = "Play";
    if (delay === null) cancelAnimationFrame(timer);
    else clearInterval(timer);
    timer = null;
  }
  function tick() {
    if (delay === null) timer = requestAnimationFrame(tick);
    if (form.i.valueAsNumber === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
      if (!loop) return stop();
      if (alternate) direction = -direction;
    }
    form.i.valueAsNumber = (form.i.valueAsNumber + direction + values.length) % values.length;
    form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
  }
  form.i.oninput = event => {
    if (event && event.isTrusted && timer) form.b.onclick();
    form.value = values[form.i.valueAsNumber];
    form.o.value = format(form.value, form.i.valueAsNumber, values);
  };
  form.b.onclick = () => {
    if (timer) return stop();
    direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
    form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
    form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
    start();
  };
  form.i.oninput();
  if (autoplay) start();
  else stop();
  disposal(form).then(stop);
  return form;
}


function valueAt(values, year) {
  const bisectYear = d3.bisector(([year]) => year).left;
  const i = bisectYear(values, year, 0, values.length - 1);
  const a = values[i];
  if (i > 0) {
    const b = values[i - 1];
    const t = (year - a[0]) / (b[0] - a[0]);
    return a[1] * (1 - t) + b[1] * t;
  }
  return a[1];
}

function dataAt(data,year) {
  return data.map(d => ({
    name: d.name,
    region: d.region,
    income: valueAt(d.income, year),
    population: valueAt(d.population, year),
    lifeExpectancy: valueAt(d.lifeExpectancy, year)
  }));
}

export {Scrubber,disposal,valueAt,dataAt};
