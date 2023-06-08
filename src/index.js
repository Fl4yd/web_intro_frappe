import "./styles.css";
import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";
const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
        ],
      },
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: [
          /*"SSS"*/
        ],
      },
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"],
      },
    },
  ],
  response: {
    format: "json-stat2",
  },
};

function formatString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const getData = async (city) => {
  const cities_data = await getCities();
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  console.log(cities_data);
  console.log(city);
  if (city in cities_data) {
    //jsonQuery.query[1].selection.values.push(cities_data[city])
    jsonQuery.query[1].selection.values = [cities_data[city]];
    console.log("City found!");
  } else {
    console.log("City not found!");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery),
  });
  if (!res.ok) {
    return;
  }
  const data = await res.json();
  console.log(data);
  return data;
};

const getCities = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const res = await fetch(url);
  const data = await res.json();
  const obj = {};
  const texts = data.variables[1].valueTexts;
  const ids = data.variables[1].values;
  texts.map((key, idx) => {
    obj[key.toLowerCase()] = ids[idx];
  });
  return obj;
};

const buildChart = async (city) => {
  const data1 = await getData(city);
  const data_values = data1.value;
  const label_names = Object.values(data1.dimension.Vuosi.category.label);
  let data_SSS = [];
  if (data_values.length == 0) {
    data_SSS = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
  } else {
    data_SSS = data_values;
  }
  let data_Other = [];
  /*
  for(let idx = 0;idx < data_values.length;idx++) {
    if (idx % 2 == 0) {
      data_SSS.push(data_values[idx])
    }else {
      data_Other.push(data_values[idx])
    }
  }*/
  const data = {
    labels: label_names,
    datasets: [
      {
        name: formatString(city),
        type: "line",
        values: data_SSS,
      } /*,
      {
        name: "Akaa",
        type: "line",
        values: data_Other
      }*/,
    ],
  };
  console.log(data);
  const chart = new frappe.Chart("#chart", {
    // or a DOM element,
    // new Chart() in case of ES6 module with above usage
    title: "Municipality chart",
    data: data,
    type: "line", // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 450,
    colors: ["red"],
    lineOptions: {
      regionFill: 1,
      hideDots: 1,
    }
  });
};
buildChart("whole country");
const submit_button = document.getElementById("submit-data");
submit_button.onclick = () => {
  const text_field = document.getElementById("input-area");
  const city = text_field.value.toLowerCase();
  buildChart(city);
};
