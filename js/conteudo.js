// conteudo.js — textos do simulador que não são interface: perguntas do júri, limites, guião da apresentação. Em PT e EN.
// Regra do projecto: nada inventado. Onde há hipótese ou falta medir, diz-se.
(function (root) {
  const X = {};
  // tag: estado da afirmação
  X.TAGS = {
    modelo: { pt: 'CÁLCULO DO MODELO · por confirmar', en: 'MODEL CALCULATION · to be confirmed', cor: '#4fc3f7' },
    hip: { pt: 'HIPÓTESE', en: 'HYPOTHESIS', cor: '#e3b341' },
    prot: { pt: 'PROTOCOLO', en: 'PROTOCOL', cor: '#4cd97b' },
    lit: { pt: 'LITERATURA · só resumos lidos', en: 'LITERATURE · abstracts only', cor: '#c792ea' },
    medir: { pt: 'POR MEDIR', en: 'TO BE MEASURED', cor: '#ff5a4d' },
    custo: { pt: 'PREÇOS VERIFICADOS · EUA, sem impostos', en: 'VERIFIED PRICES · USA, before tax', cor: '#F28C28' }
  };
  X.FAQ = [
    { tag: 'modelo',
      q: { pt: 'Porque 1,7 MHz e não 40 kHz?', en: 'Why 1.7 MHz and not 40 kHz?' },
      a: { pt: 'A força do campo sobre as gotas cresce com a frequência. Com os campos de pressão que estimamos para cada versão, o nosso modelo dá cerca de 20 vezes a flutuação a 1,7 MHz e cerca de 5 % a 40 kHz. Por isso a Versão A (banho de limpeza, 40 kHz) deve dar efeito pequeno ou nulo, e a Versão B é a que pode funcionar.',
           en: 'The force of the field on the droplets grows with frequency. With the pressure fields we estimate for each version, our model gives about 20 times buoyancy at 1.7 MHz and about 5 % at 40 kHz. So Version A (cleaning bath, 40 kHz) should give a small or null effect, and Version B is the one that may work.' } },
    { tag: 'prot',
      q: { pt: 'E se não funcionar?', en: 'What if it does not work?' },
      a: { pt: 'Um resultado nulo também é resultado. O ensaio compara pares de amostras (com e sem ultrassons) à mesma temperatura, em ordem aleatória e com contagem às cegas, e só aceita um efeito acima de uma margem definida de antemão (razão de 1,25). Dizer «não vimos efeito» é uma conclusão válida.',
           en: 'A null result is still a result. The test compares pairs of samples (with and without ultrasound) at the same temperature, in random order and with blind counting, and only accepts an effect above a margin set beforehand (ratio of 1.25). Saying "we saw no effect" is a valid conclusion.' } },
    { tag: 'hip',
      q: { pt: 'Há risco de cavitação?', en: 'Is there a cavitation risk?' },
      a: { pt: 'A 40 kHz, num banho de limpeza, há cavitação e ela pode misturar ou partir gotas, o que confundiria o efeito da força do campo. A MHz o índice mecânico calculado é baixo (cerca de 0,23, um indicador aproximado), mas o limiar não foi verificado por nós.',
           en: 'At 40 kHz, in a cleaning bath, there is cavitation and it can mix or break droplets, which would confuse the effect of the field force. At MHz the calculated mechanical index is low (about 0.23, a rough indicator), but we have not verified the threshold.' } },
    { tag: 'medir',
      q: { pt: 'Como medem o resultado?', en: 'How do you measure the result?' },
      a: { pt: 'Ao microscópio: o tamanho das gotas de cada amostra, aos 0, 10 e 30 minutos. O desfecho principal é a razão entre o tamanho com e sem ultrassons aos 10 minutos. A temperatura é vigiada em tempo real, para o calor não explicar o efeito.',
           en: 'Under the microscope: the droplet size of each sample, at 0, 10 and 30 minutes. The main endpoint is the ratio of sizes with and without ultrasound at 10 minutes. Temperature is monitored in real time, so heat does not explain the effect.' } },
    { tag: 'custo',
      q: { pt: 'Quanto custa montar?', en: 'How much does it cost to build?' },
      a: { pt: 'Só temos preços verificados para a Versão A: banho ultrassónico entre US$ 62,88 e 73,99, e micrómetro entre US$ 7,96 e 51,99, se não os tivermos. Para a Versão B não há preços verificados. O projecto está aprovado e o pedido de material ao ISPTEC está preparado.',
           en: 'We only have verified prices for Version A: ultrasonic bath between US$ 62.88 and 73.99, and a micrometer between US$ 7.96 and 51.99, if we do not have one. For Version B there are no verified prices. The project is approved and the materials request to ISPTEC is prepared.' } },
    { tag: 'modelo',
      q: { pt: 'Isto não é só uma simulação?', en: 'Is this just a simulation?' },
      a: { pt: 'É. Este simulador mostra a ideia e as razões de força do modelo da Fase 4. A coalescência dentro do vaso é um modelo de brinquedo. Ainda não há resultados experimentais; os ensaios de bancada são o passo seguinte.',
           en: 'It is. This simulator shows the idea and the force ratios of the Phase 4 model. Coalescence inside the vessel is a toy model. There are no experimental results yet; bench tests are the next step.' } },
    { tag: 'lit',
      q: { pt: 'Isto já existe na indústria?', en: 'Does this already exist in industry?' },
      a: { pt: 'Há estudos publicados sobre coalescência de gotas com ondas ultrassónicas estacionárias, em emulsões de água em óleo e de óleo em água, e patentes sobre acustoforese. Não encontrámos aplicação comercial em águas produzidas. O que lemos foram resumos, não os artigos completos.',
           en: 'There are published studies on droplet coalescence with ultrasonic standing waves, in water-in-oil and oil-in-water emulsions, and patents on acoustophoresis. We found no commercial application in produced water. What we read were abstracts, not the full papers.' } },
    { tag: 'hip',
      q: { pt: 'Porque dentro do vaso separador?', en: 'Why inside the separator vessel?' },
      a: { pt: 'O módulo antes dos hidrociclones é uma hipótese nossa de posicionamento: gotas maiores à entrada ajudariam o resto do comboio de tratamento. Não é um desenho de engenharia validado.',
           en: 'The module before the hydrocyclones is our hypothesis for placement: larger droplets at the inlet would help the rest of the treatment train. It is not a validated engineering design.' } },
    { tag: 'medir',
      q: { pt: 'Quanto reduz os equipamentos?', en: 'How much does it reduce equipment?' },
      a: { pt: 'Não sabemos. Só medições dirão se o vaso, os hidrociclones, a flotação ou o demulsificante podem diminuir, e quanto. Por isso o painel dos equipamentos não tem números.',
           en: 'We do not know. Only measurements will tell whether the vessel, hydrocyclones, flotation or demulsifier can be reduced, and by how much. That is why the equipment panel has no numbers.' } },
    { tag: 'modelo',
      q: { pt: 'O «mais óleo captado» do simulador é real?', en: 'Is the simulator\'s "more oil captured" real?' },
      a: { pt: 'É o resultado do modelo de brinquedo, útil para ver o efeito de forma qualitativa. Não é previsão nem medição, e depende de hipóteses (camadas ampliadas, atracção esquemática entre gotas).',
           en: 'It is the result of the toy model, useful to see the effect qualitatively. It is neither a forecast nor a measurement, and it depends on assumptions (magnified layers, schematic attraction between droplets).' } }
  ];
  X.LIMITES_NAO = [
    { pt: 'Não prova que o método funciona: ainda não há ensaios.', en: 'It does not prove the method works: there are no tests yet.' },
    { pt: 'A coalescência no vaso é um modelo de brinquedo; o «×N mais óleo captado» sai dele.', en: 'Coalescence in the vessel is a toy model; the "×N more oil captured" comes from it.' },
    { pt: 'As camadas estão ampliadas cerca de 450 vezes para se verem.', en: 'The layers are magnified about 450 times so they can be seen.' },
    { pt: 'O modelo é 1-D ideal: sem turbulência real, sem cavitação, sem campo não uniforme.', en: 'The model is an ideal 1-D one: no real turbulence, no cavitation, no non-uniform field.' },
    { pt: 'Hipóteses de escala: módulo de 1,2 m², rendimento de 50 %, reflexão de 0,9.', en: 'Scale assumptions: 1.2 m² module, 50 % efficiency, 0.9 reflection.' },
    { pt: 'O óleo é um crude médio (ρ = 900 kg/m³, c = 1450 m/s): valores do projecto, típicos de um crude médio, a confirmar.', en: 'The oil is a medium crude (ρ = 900 kg/m³, c = 1450 m/s): project values, typical of a medium crude, to be confirmed.' },
    { pt: 'Sem viscosidade real, asfaltenos, sal na água nem emulsões estabilizadas. O ensaio de bancada usa óleo vegetal e de motor novos; o crude só aparece aqui.', en: 'No real viscosity, asphaltenes, salt in the water or stabilized emulsions. The bench test uses new vegetable and motor oil; crude appears only here.' },
    { pt: 'Os equipamentos «a minimizar» são hipóteses, sem números.', en: 'The "equipment to minimize" are hypotheses, without numbers.' }
  ];
  X.LIMITES_SIM = [
    { pt: 'As razões entre a força do campo e a flutuação, do modelo da Fase 4.', en: 'The ratios between field force and buoyancy, from the Phase 4 model.' },
    { pt: 'A ordem de grandeza do aquecimento, por balanço de energia.', en: 'The order of magnitude of heating, from an energy balance.' },
    { pt: 'Porque 40 kHz deve dar pouco e MHz pode dar muito, e o papel da ressonância.', en: 'Why 40 kHz should give little and MHz may give a lot, and the role of resonance.' }
  ];
  // guião da apresentação guiada. cam: [posição, alvo]; pane: painel em tela cheia; fn: acção
  X.TOUR = [
    { d: 8, cam: [[-12, 6.5, 10], [0, 2.3, 0]], fn: 'reset', cap: { pt: 'Este é o simulador do projecto COALESCER. Mostra uma ideia, não uma prova.', en: 'This is the simulator for the COALESCER project. It shows an idea, not a proof.' } },
    { d: 9, cam: [[-2.5, 3.2, 7.5], [0, 2.1, 0]], vel: 8, fn: 'rapido', cap: { pt: 'O problema: as gotículas de óleo na água são tão pequenas que quase não sobem. Separam-se devagar.', en: 'The problem: oil droplets in water are so small that they hardly rise. They separate slowly.' } },
    { d: 8, cam: [[0, 2.4, 5.6], [0, 2.0, 0]], vel: 8, fn: 'on', cap: { pt: 'Ligamos o método: uma onda sonora estacionária numa câmara dentro do vaso.', en: 'We switch the method on: a standing sound wave in a chamber inside the vessel.' } },
    { d: 13, vel: 2, cam: [[0.8, 1.9, 3.0], [0.2, 1.7, 0]], cap: { pt: 'As gotas arrumam-se em camadas (aqui ampliadas cerca de 450 vezes) e juntam-se. Fora do campo, sobem muito mais depressa.', en: 'Droplets line up in layers (here magnified about 450 times) and merge. Outside the field they rise much faster.' } },
    { d: 10, vel: 8, pane: 'ondas', cap: { pt: 'A 1,7 MHz o cálculo dá uma força cerca de 20 vezes a flutuação. A 40 kHz, menos de 5 %.', en: 'At 1.7 MHz the calculation gives a force about 20 times buoyancy. At 40 kHz, under 5 %.' } },
    { d: 12, vel: 8, pane: 'vaso', cap: { pt: 'Nesta simulação, com o método sai mais óleo captado do que sem ele. É o modelo de brinquedo, não uma medição.', en: 'In this simulation, more oil is captured with the method than without. It is the toy model, not a measurement.' } },
    { d: 9, pane: 'equipamentos', cap: { pt: 'Se resultasse, poderiam diminuir hidrociclones, flotação, demulsificante e o vaso. É hipótese: só os ensaios dirão quanto.', en: 'If it worked, hydrocyclones, flotation, demulsifier and the vessel could shrink. It is a hypothesis: only tests will tell by how much.' } },
    { d: 10, cam: [[-5, 2.6, 7.5], [-10.5, 1.8, 0.5]], fn: 'compareOn', cap: { pt: 'Na sala, os equipamentos convencionais ficam a vermelho: é o que a ideia tentaria reduzir.', en: 'In the room, conventional equipment turns red: this is what the idea would try to reduce.' } },
    { d: 11, cam: [[0.8, 1.9, 3.0], [0.2, 1.7, 0]], vel: 3, fn: 'cenA', cap: { pt: 'Versão A, 40 kHz: esperamos efeito pequeno ou nulo. Repara que as gotas já não se arrumam.', en: 'Version A, 40 kHz: we expect a small or null effect. Notice the droplets no longer line up.' } },
    { d: 11, vel: 3, fn: 'cenB', cap: { pt: 'Versão B, 1,7 MHz: o efeito pode ser grande, se o calor e a ressonância deixarem.', en: 'Version B, 1.7 MHz: the effect may be large, if heat and resonance allow.' } },
    { d: 12, vel: 3, pane: 'ondas', fn: 'calor', cap: { pt: 'E se aquece demais? A água aquece, a velocidade do som muda, a cavidade desafina e o ganho cai.', en: 'What if it heats too much? The water warms, the speed of sound changes, the cavity detunes and the gain drops.' } },
    { d: 11, pane: 'limites', cap: { pt: 'O que isto não prova: ainda não há resultados experimentais. O próximo passo é o ensaio de bancada.', en: 'What this does not prove: there are no experimental results yet. The next step is the bench test.' } },
    { d: 7, cam: [[-12, 6.5, 10], [0, 2.3, 0]], fn: 'reset', cap: { pt: 'COALESCER · Oscilações e Ondas · Engenharia Petrolífera · ISPTEC', en: 'COALESCER · Oscillations and Waves · Petroleum Engineering · ISPTEC' } }
  ];
  root.Conteudo = X;
})(window);
