// simulados.js

const TANQUES_SIMULADOS = [
  {
    tanque_id: 1,
    nome_tanque: "Tanque 1",
    especie: "Tambaqui",
    capacidade: "200 m³",
    condutividade: 480
  },
  {
    tanque_id: 2,
    nome_tanque: "Tanque 2",
    especie: "Pintado",
    capacidade: "150 m³",
    condutividade: 860
  },
  {
    tanque_id: 3,
    nome_tanque: "Tanque 3",
    especie: "Tilápia",
    capacidade: "180 m³",
    condutividade: 1320
  }
];

const HISTORICO_SIMULADO = {
  1: [
    { timestamp: Date.now() - 60000 * 5, condutividade: 455 },
    { timestamp: Date.now() - 60000 * 4, condutividade: 470 },
    { timestamp: Date.now() - 60000 * 3, condutividade: 480 },
    { timestamp: Date.now() - 60000 * 2, condutividade: 475 },
    { timestamp: Date.now() - 60000, condutividade: 478 },
    { timestamp: Date.now(), condutividade: 480 }
  ],
  2: [
    { timestamp: Date.now() - 60000 * 5, condutividade: 820 },
    { timestamp: Date.now() - 60000 * 4, condutividade: 850 },
    { timestamp: Date.now() - 60000 * 3, condutividade: 870 },
    { timestamp: Date.now() - 60000 * 2, condutividade: 855 },
    { timestamp: Date.now() - 60000, condutividade: 860 },
    { timestamp: Date.now(), condutividade: 860 }
  ],
  3: [
    { timestamp: Date.now() - 60000 * 5, condutividade: 1250 },
    { timestamp: Date.now() - 60000 * 4, condutividade: 1270 },
    { timestamp: Date.now() - 60000 * 3, condutividade: 1290 },
    { timestamp: Date.now() - 60000 * 2, condutividade: 1300 },
    { timestamp: Date.now() - 60000, condutividade: 1310 },
    { timestamp: Date.now(), condutividade: 1320 }
  ]
};
