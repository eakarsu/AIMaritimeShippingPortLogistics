const express = require('express');

const router = express.Router();

let allocations = [
  { id: 1, yardBlock: 'R1', vessel: 'MV Polar Star', plugsRequired: 62, plugsAvailable: 74, cutOff: '2026-05-22 18:00', cargoClass: 'pharma', status: 'covered' },
  { id: 2, yardBlock: 'R4', vessel: 'MV Green Channel', plugsRequired: 45, plugsAvailable: 38, cutOff: '2026-05-22 23:30', cargoClass: 'frozen seafood', status: 'short' },
  { id: 3, yardBlock: 'R2', vessel: 'MV Atlas Bay', plugsRequired: 28, plugsAvailable: 30, cutOff: '2026-05-23 07:00', cargoClass: 'produce', status: 'covered' }
];

router.get('/', (req, res) => {
  const summary = allocations.reduce((acc, row) => {
    acc.total += 1;
    acc.short += row.plugsRequired > row.plugsAvailable ? 1 : 0;
    acc.netAvailable += Number(row.plugsAvailable || 0) - Number(row.plugsRequired || 0);
    return acc;
  }, { total: 0, short: 0, netAvailable: 0 });
  res.json({ allocations, summary });
});

router.post('/', (req, res) => {
  const item = {
    id: Date.now(),
    yardBlock: req.body.yardBlock || 'R-unassigned',
    vessel: req.body.vessel || 'Pending vessel',
    plugsRequired: Number(req.body.plugsRequired || 0),
    plugsAvailable: Number(req.body.plugsAvailable || 0),
    cutOff: req.body.cutOff || 'TBD',
    cargoClass: req.body.cargoClass || 'temperature controlled',
    status: req.body.status || 'pending'
  };
  allocations = [item, ...allocations];
  res.status(201).json(item);
});

module.exports = router;
