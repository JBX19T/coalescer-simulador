// i18n.js — tradução PT → EN por dicionário (o PT é o texto original). Sem entrada no dicionário, mostra-se o PT.
// Em EN, as vírgulas decimais passam a pontos (1,7 MHz → 1.7 MHz).
(function (root) {
  const I = { lang: 'pt', D: {}, R: [], coletar: false, vistos: new Set() };
  const D = I.D;
  const add = (o) => Object.assign(D, o);

  // ---------------- interface (index.html e HUD)
  add({
    'SIMULAÇÃO · HIPÓTESE DO PROJECTO': 'SIMULATION · PROJECT HYPOTHESIS', 'MISSÃO': 'MISSION',
    'SIMULADOR 3D · entra no vaso separador': '3D SIMULATOR · step into the separator vessel',
    'Um jogo em primeira pessoa para ver a ideia do projecto: como um campo sonoro poderia juntar gotículas de óleo e que equipamentos poderiam diminuir.': 'A first-person game to see the project idea: how a sound field could merge oil droplets and which equipment could shrink.',
    'É uma <b>simulação</b> de uma hipótese. O projecto ainda não tem resultados experimentais, e nada aqui é medição.': 'This is a <b>simulation</b> of a hypothesis. The project has no experimental results yet, and nothing here is a measurement.',
    'Carrega ✕ (comando) ou clica para começar': 'Press ✕ (controller) or click to start',
    'Liga o comando PS4 por cabo USB. Teclado e rato também funcionam. Carrega em K para configurar os botões do comando.': 'Connect the PS4 controller by USB cable. Keyboard and mouse also work. Press K to configure the controller buttons.',
    'Touchpad ou G: apresentação guiada · L: idioma': 'Touchpad or G: guided presentation · L: language',
    'simulador 3D': '3D simulator',
    // dicas
    'andar': 'walk', 'olhar': 'look', 'abrir': 'open', 'método': 'method', 'tablet': 'tablet', 'correr': 'run', 'apresentação': 'presentation', 'foto': 'photo', 'ajuda': 'help', 'saltar introdução': 'skip intro',
    'abrir o Painel de Parâmetros': 'open the Parameters panel', 'abrir o Painel de Ondas': 'open the Waves panel', 'abrir o Painel do Vaso': 'open the Vessel panel', 'abrir os Equipamentos a minimizar': 'open the Equipment to minimize', 'abrir o Projecto': 'open the Project',
    // missão
    'Abre o Painel de Parâmetros (aproxima-te e carrega ✕)': 'Open the Parameters panel (walk up and press ✕)', 'Liga o método acústico (□): os painéis acendem-se nas paredes': 'Switch the acoustic method on (□): the panels light up on the walls',
    'Observa as gotas a juntarem-se dentro do vaso': 'Watch the droplets merge inside the vessel', 'Abre o Painel de Ondas': 'Open the Waves panel', 'No Painel do Vaso, compara SEM e COM método': 'In the Vessel panel, compare WITHOUT and WITH the method',
    'Abre o tablet (△) e vê os equipamentos a minimizar': 'Open the tablet (△) and see the equipment to minimize',
    // toasts
    'Missão cumprida! Experimenta o cenário «Versão A» nos Parâmetros e vê o que acontece.': 'Mission accomplished! Try the "Version A" scenario in Parameters and see what happens.',
    'Método acústico LIGADO · painéis a acender': 'Acoustic method ON · panels lighting up', 'Método acústico DESLIGADO': 'Acoustic method OFF',
    'Modo comparação: equipamentos convencionais a vermelho': 'Comparison mode: conventional equipment in red', 'Modo comparação desligado': 'Comparison mode off',
    'Aproxima-te de um painel (✕) ou carrega □ para ligar o método': 'Walk up to a panel (✕) or press □ to switch the method on',
    'Comando ligado': 'Controller connected', 'Comando desligado': 'Controller disconnected', 'Comando detectado: ': 'Controller detected: ', 'Comando desligado.': 'Controller disconnected.',
    'Qualidade reduzida: brilho desligado': 'Quality reduced: glow off', 'Mapa do comando reposto': 'Controller map reset', 'Comando configurado e guardado neste navegador': 'Controller configured and saved in this browser',
    'Liga o comando e carrega num botão para o computador o detectar': 'Connect the controller and press a button so the computer detects it',
    'Apresentação terminada. Experimenta tu: aproxima-te de um painel.': 'Presentation finished. Now you try: walk up to a panel.', 'Foto guardada': 'Photo saved',
    'Carrega em qualquer botão para sair': 'Press any button to exit', 'Prime qualquer tecla para sair': 'Press any key to exit',
    // introdução
    'Uma unidade de processamento de petróleo.': 'An oil processing unit.', 'Dentro deste vaso, a água e o óleo separam-se… devagar.': 'Inside this vessel, water and oil separate… slowly.',
    'As gotículas mais pequenas quase não sobem.': 'The smallest droplets hardly rise.', 'E se um campo sonoro as ajudasse a juntar-se?': 'What if a sound field helped them merge?', 'Entra. Liga o método. Observa.': 'Step in. Switch the method on. Watch.',
    // legenda dos painéis e ajuda
    'ligar/desligar método': 'switch method on/off', 'ΔT da água (K) →': 'Water ΔT (K) →', 'comparar': 'compare',
    'painel': 'panel', 'escolher': 'choose', 'ajustar': 'adjust', 'liga/desliga método': 'method on/off', 'fechar': 'close',
    'Ajuda e opções': 'Help and options', 'Stick esquerdo': 'Left stick', 'Stick direito': 'Right stick', 'olhar à volta': 'look around', 'R2 (ou Shift)': 'R2 (or Shift)',
    '✕ (E)': '✕ (E)', 'abrir o painel que estás a olhar · confirmar': 'open the panel you are looking at · confirm', '○ (Backspace)': '○ (Backspace)', 'fechar / voltar': 'close / back',
    'ligar / desligar o método acústico': 'switch the acoustic method on / off', 'tirar / guardar o tablet': 'take out / stow the tablet', 'painel anterior / seguinte': 'previous / next panel',
    'escolher e ajustar valores': 'choose and adjust values', 'Touchpad (G)': 'Touchpad (G)', 'apresentação guiada': 'guided presentation', 'Share (F2)': 'Share (F2)', 'fotografia (guarda uma imagem)': 'photo (saves an image)', 'Options (H)': 'Options (H)', 'esta janela': 'this window',
    'configurar o comando (carregar em cada botão)': 'configure the controller (press each button)', 'repor o mapa original': 'reset the original map', 'mapa': 'map', 'original': 'original', 'personalizado': 'custom',
    'brilho (bloom)': 'glow (bloom)', 'som': 'sound', 'ligado': 'on', 'desligado': 'off', 'ecrã inteiro': 'full screen', 'modo quiosque': 'kiosk mode', 'idioma': 'language',
    'Comando': 'Controller', 'não detectado (carrega num botão do comando)': 'not detected (press a button on the controller)', 'botões premidos': 'buttons pressed', 'Comando não detectado.': 'Controller not detected.', 'Eixos': 'Axes',
    'Simulação de uma hipótese. Sem resultados experimentais. As razões de força vêm do modelo da Fase 4; a coalescência é esquemática.': 'Simulation of a hypothesis. No experimental results. The force ratios come from the Phase 4 model; coalescence is schematic.',
    'Carrega Options (H) para voltar.': 'Press Options (H) to go back.',
    'método ligado': 'method on', 'método desligado': 'method off',
    // assistente do comando
    'Configurar comando': 'Configure controller', 'Larga tudo e espera…': 'Release everything and wait…', 'À espera do botão…': 'Waiting for the button…', 'Teclado': 'Keyboard', 'salta este passo': 'skips this step', 'cancela': 'cancels',
    'Esse eixo já foi usado noutro stick. Tenta outra vez, só o stick pedido.': 'That axis was already used by another stick. Try again, only the requested stick.',
    'Empurra o STICK ESQUERDO para a DIREITA': 'Push the LEFT STICK to the RIGHT', 'Empurra o STICK ESQUERDO para BAIXO': 'Push the LEFT STICK DOWN', 'Empurra o STICK DIREITO para a DIREITA': 'Push the RIGHT STICK to the RIGHT', 'Empurra o STICK DIREITO para BAIXO': 'Push the RIGHT STICK DOWN',
    'Carrega em ✕ (abrir / confirmar)': 'Press ✕ (open / confirm)', 'Carrega em ○ (voltar / fechar)': 'Press ○ (back / close)', 'Carrega em □ (ligar/desligar método)': 'Press □ (method on/off)', 'Carrega em △ (tablet)': 'Press △ (tablet)',
    'Carrega em L1': 'Press L1', 'Carrega em R1': 'Press R1', 'Carrega em R2 (correr)': 'Press R2 (run)', 'Carrega em OPTIONS (ajuda)': 'Press OPTIONS (help)',
    'Carrega na seta ↑': 'Press the ↑ arrow', 'Carrega na seta ↓': 'Press the ↓ arrow', 'Carrega na seta ←': 'Press the ← arrow', 'Carrega na seta →': 'Press the → arrow',
    'Carrega em SHARE (fotografia) · N salta': 'Press SHARE (photo) · N skips', 'Carrega no TOUCHPAD (apresentação guiada) · N salta': 'Press the TOUCHPAD (guided presentation) · N skips',
    // nomes dos painéis
    'Parâmetros': 'Parameters', 'Ondas': 'Waves', 'Vaso': 'Vessel', 'Equipamentos': 'Equipment', 'O projecto': 'The project', 'Perguntas': 'Questions', 'Limites': 'Limits',
    'Livre (ajustas tu)': 'Free (you adjust)', 'Versão A · banho 40 kHz': 'Version A · 40 kHz bath', 'Versão B · célula 1,7 MHz': 'Version B · 1.7 MHz cell', 'E se aquece demais?': 'What if it overheats?',
    '40 kHz · Versão A': '40 kHz · Version A', '1,7 MHz · Versão B': '1.7 MHz · Version B'
  });

  // ---------------- etiquetas 3D
  add({
    'PAINEL DE PARÂMETROS': 'PARAMETERS PANEL', 'PAINEL DO VASO': 'VESSEL PANEL', 'PAINEL DE ONDAS': 'WAVES PANEL', 'PARÂMETROS': 'PARAMETERS', 'VASO': 'VESSEL', 'EQUIPAMENTOS': 'EQUIPMENT', 'ONDAS': 'WAVES',
    'MÓDULO DE COALESCÊNCIA ACÚSTICA': 'ACOUSTIC COALESCENCE MODULE', 'janela ampliada · fora de escala': 'magnified window · not to scale', 'ENTRADA · emulsão óleo/água': 'INLET · oil/water emulsion', 'ÓLEO ▲': 'OIL ▲', 'ÁGUA ▼': 'WATER ▼',
    'HIDROCICLONES · carga menor (a confirmar)': 'HYDROCYCLONES · smaller load (to be confirmed)', 'FLOTAÇÃO · carga menor (a confirmar)': 'FLOTATION · smaller load (to be confirmed)',
    'DEMULSIFICANTE QUÍMICO · dose menor (a confirmar)': 'CHEMICAL DEMULSIFIER · smaller dose (to be confirmed)', 'VASO CONVENCIONAL · mais volume e tempo de residência (a confirmar)': 'CONVENTIONAL VESSEL · more volume and residence time (to be confirmed)'
  });

  // ---------------- painéis
  add({
    'Aquecimento da água ΔT': 'Water heating ΔT', 'COM O MÓDULO COALESCER (HIPÓTESE)': 'WITH THE COALESCER MODULE (HYPOTHESIS)', 'COMANDO PS4': 'PS4 CONTROLLER', 'COMPARAÇÃO: DESLIGADA': 'COMPARISON: OFF', 'COMPARAÇÃO: LIGADA': 'COMPARISON: ON',
    'Cenário pronto': 'Ready-made scenario', 'Com': 'With', 'Sem': 'Without', 'Comprimento de onda λ': 'Wavelength λ', 'Contraste acústico Φ': 'Acoustic contrast Φ', 'D-pad escolhe · ✕ abre · △ guarda': 'D-pad selects · ✕ opens · △ stows',
    'D50 À SAÍDA': 'D50 AT OUTLET', 'DESLIGADO': 'OFF', 'LIGADO': 'ON', 'DISTRIBUIÇÃO DE TAMANHOS À SAÍDA (diâmetro, µm)': 'SIZE DISTRIBUTION AT THE OUTLET (diameter, µm)',
    'Demulsificante': 'Demulsifier', 'Demulsificante químico': 'Chemical demulsifier', 'Demulsificante: a coalescência acústica poderia substituir parte da dose': 'Demulsifier: acoustic coalescence could replace part of the dose',
    'ENTRADA ▶': 'INLET ▶', 'EQUIPAMENTOS A MINIMIZAR': 'EQUIPMENT TO MINIMIZE', 'ESTADO REAL': 'REAL STATUS', 'ESTADO REAL DO PROJECTO': "PROJECT'S REAL STATUS",
    'Estudamos se um campo ultrassónico altera o tamanho das gotículas numa emulsão de óleo em água. Gotas maiores sobem mais depressa e separam-se melhor. Este simulador mostra a ideia dentro de um vaso separador.': 'We study whether an ultrasonic field changes the size of droplets in an oil-in-water emulsion. Larger droplets rise faster and separate better. This simulator shows the idea inside a separator vessel.',
    'F ac. / FLUTUAÇÃO': 'F ac. / BUOYANCY', 'F ac. / flutuação': 'F ac. / buoyancy', 'Flotação': 'Flotation', 'Frequência': 'Frequency', 'Ganho de ressonância': 'Resonance gain',
    'Gotas dentro da câmara arrumam-se em camadas, juntam-se e depois, fora do campo, sobem para a camada de óleo muito mais depressa (v ∝ raio²).': 'Droplets inside the chamber line up in layers and merge, then, outside the field, rise to the oil layer much faster (v ∝ radius²).',
    'Hidrociclones': 'Hydrocyclones', 'Hidrociclones / flotação: menos óleo fino chega a jusante': 'Hydrocyclones / flotation: less fine oil reaches downstream',
    'Hipóteses de escala: módulo de 1,2 m², rendimento de 50 %, reflexão de 0,9.': 'Scale assumptions: 1.2 m² module, 50 % efficiency, 0.9 reflection.',
    'INTERIOR DO VASO · vista lateral (ao vivo)': 'INSIDE THE VESSEL · side view (live)', 'MÉTODO ACÚSTICO LIGADO': 'ACOUSTIC METHOD ON', 'MÉTODO ACÚSTICO DESLIGADO': 'ACOUSTIC METHOD OFF', 'MÉTODO DESLIGADO': 'METHOD OFF', 'MÉTODO LIGADO': 'METHOD ON', 'Método acústico': 'Acoustic method',
    'Nenhum número aqui: só as': 'No numbers here: only', 'medições dirão quanto reduz.': 'measurements will say how much it reduces.',
    'O PROJECTO': 'THE PROJECT', 'O QUE ISTO NÃO PROVA': 'WHAT THIS DOES NOT PROVE', 'O QUE MOSTRA': 'WHAT IT SHOWS', 'NÃO PROVA / LIMITES': 'DOES NOT PROVE / LIMITS', 'O QUE TERIA DE SER PROVADO PARA CADA «MENOR»': 'WHAT WOULD HAVE TO BE PROVEN FOR EACH "SMALLER"',
    'O calor muda a velocidade do som e desafina a cavidade.': 'Heat changes the speed of sound and detunes the cavity.', 'ONDA ESTACIONÁRIA NA CÉLULA': 'STANDING WAVE IN THE CELL', 'OSCILAÇÃO DA PRESSÃO (câmara lenta)': 'PRESSURE OSCILLATION (slow motion)',
    'PAINEL DE ONDAS ': 'WAVES PANEL', 'PAINEL DO VASO SEPARADOR': 'SEPARATOR VESSEL PANEL', 'PERGUNTAS DO JÚRI': 'JURY QUESTIONS', 'POR MEDIR': 'TO BE MEASURED',
    'PORQUE 1,7 MHz E NÃO 40 kHz?  (mesma pressão para todas)': 'WHY 1.7 MHz AND NOT 40 kHz?  (same pressure for all)', 'Potência eléctrica (módulo)': 'Electrical power (module)', 'Prende, mas pouco: camadas fracas': 'Traps, but weakly: faint layers', 'Pressão acústica p₀': 'Acoustic pressure p₀',
    'Projecto aprovado. Ainda sem resultados experimentais. O próximo passo é o ensaio de bancada da Versão A, com pares de amostras, mesma temperatura, ordem aleatória e contagem às cegas.': 'Project approved. No experimental results yet. The next step is the bench test of Version A, with sample pairs, same temperature, random order and blind counting.',
    'Projecto de Oscilações e Ondas · Engenharia Petrolífera · ISPTEC · José Mussango, Dadilson Miguel, Idiana João': 'Oscillations and Waves project · Petroleum Engineering · ISPTEC · José Mussango, Dadilson Miguel, Idiana João',
    'RAZÃO  F acústica / flutuação': 'RATIO  acoustic force / buoyancy', 'RESSONÂNCIA vs. AQUECIMENTO': 'RESONANCE vs. HEATING', 'Respostas curtas e honestas: o que é cálculo, o que é hipótese e o que falta medir.': 'Short, honest answers: what is calculation, what is hypothesis and what is still to be measured.',
    'SEM MÉTODO  vs  COM MÉTODO': 'WITHOUT METHOD  vs  WITH METHOD', 'SIMULAÇÃO · hipótese do projecto': 'SIMULATION · project hypothesis', 'SIMULAÇÃO · hipótese do projecto · não são medições': 'SIMULATION · project hypothesis · not measurements',
    'Se alguém perguntar «isto é real?»: é uma ilustração de uma hipótese, com os limites aqui escritos.': 'If someone asks "is this real?": it is an illustration of a hypothesis, with the limits written here.',
    'Setas': 'Arrows', 'Stick dir.': 'Right stick', 'Stick esq.': 'Left stick',
    'Simulação esquemática (modelo de brinquedo com as razões de força do projecto). O que sai daqui não é previsão nem medição.': "Schematic simulation (toy model with the project's force ratios). What comes out of it is neither a forecast nor a measurement.",
    'TABLET · painéis de análise': 'TABLET · analysis panels', 'TREM DE TRATAMENTO CONVENCIONAL': 'CONVENTIONAL TREATMENT TRAIN',
    'Teclado: WASD · rato · E · Backspace · R · T · Z/C · G apresentação · F2 foto · H ajuda': 'Keyboard: WASD · mouse · E · Backspace · R · T · Z/C · G presentation · F2 photo · H help',
    'Tempo de arrumação (a = 1,5 µm)': 'Lining-up time (a = 1.5 µm)',
    'Todas as reduções são hipóteses a confirmar. Em modo comparação (△ no tablet) os equipamentos convencionais ficam a vermelho na sala.': 'All reductions are hypotheses to be confirmed. In comparison mode (△ on the tablet) the conventional equipment turns red in the room.',
    'Valores de um modelo 1-D simplificado e de uma simulação esquemática. Não são medições; o tamanho real das gotas só se obtém ao microscópio.': 'Values from a simplified 1-D model and a schematic simulation. They are not measurements; the real droplet size can only be obtained under the microscope.',
    'Vaso + módulo': 'Vessel + module', 'Vaso separador': 'Separator vessel', 'Vaso: gotas maiores sobem mais depressa → menos tempo de residência': 'Vessel: larger droplets rise faster → less residence time',
    'Vazão': 'Flow rate', 'Velocidade da simulação': 'Simulation speed', 'a jusante': 'downstream', 'a medir…': 'measuring…', 'azul: pequenas · laranja: grandes, sobem depressa': 'blue: small · orange: large, rise fast',
    'câmara acústica': 'acoustic chamber', 'das gotas que chegam ao fim do vaso': 'of the droplets that reach the end of the vessel', 'dose menor?': 'smaller dose?', 'carga menor?': 'smaller load?', 'volume menor?': 'smaller volume?', 'volume grande': 'large volume',
    'equipamentos a vermelho': 'equipment in red', 'figura ampliada · as gotas (laranja) vão para os antinodos': 'magnified figure · droplets (orange) move to the antinodes', 'ganho': 'gain',
    'modelo de brinquedo, não é previsão': 'toy model, not a forecast', 'só afecta o tempo do ecrã': 'only affects on-screen time', 'um toque: ◀ ▶': 'one touch: ◀ ▶', 'zona de decantação': 'settling zone',
    'ÁGUA': 'WATER', 'ÓLEO': 'OIL', 'Água tratada': 'Treated water', 'Índice mecânico (proxy)': 'Mechanical index (proxy)', 'ÓLEO CAPTADO': 'OIL CAPTURED', 'ÓLEO CAPTADO (nesta simulação)': 'OIL CAPTURED (in this simulation)',
    'λ/2 (distância entre camadas)': 'λ/2 (distance between layers)', '— (liga/desliga com □)': '— (toggle with □)', '□ liga / desliga': '□ on / off', '↑ ↓  escolhe a pergunta': '↑ ↓  choose the question', '↑ ↓ no ecrã inteiro': '↑ ↓ in full screen',
    'Será que o som consegue juntar gotículas de óleo?': 'Can sound merge oil droplets?', 'COALESCÊNCIA ACÚSTICA DE GOTÍCULAS': 'ACOUSTIC COALESCENCE OF DROPLETS',
    'A força DOMINA: as gotas arrumam-se em camadas': 'The force DOMINATES: droplets line up in layers', 'A força é MENOR que a flutuação: não prende as gotas': 'The force is SMALLER than buoyancy: it does not trap the droplets',
    '• A 40 kHz esperamos efeito pequeno ou nulo (força ≈ 5 % da flutuação).': '• At 40 kHz we expect a small or null effect (force ≈ 5 % of buoyancy).',
    '• A ≈ 1,7 MHz o cálculo dá ≈ 20×, por confirmar; calor e ressonância são os riscos.': '• At ≈ 1.7 MHz the calculation gives ≈ 20×, to be confirmed; heat and resonance are the risks.',
    '• Ainda não há resultados experimentais.': '• There are no experimental results yet.', '• Este simulador é uma ilustração da hipótese, não uma prova.': '• This simulator is an illustration of the hypothesis, not a proof.',
    '• Projecto aprovado; ensaios de bancada por começar.': '• Project approved; bench tests yet to start.',
    '→ Comparar a dose necessária com e sem o campo, na mesma emulsão.': '→ Compare the dose needed with and without the field, in the same emulsion.',
    '→ Medir o tamanho das gotas (microscópio) e o tempo de separação, com e sem ultrassons.': '→ Measure droplet size (microscope) and separation time, with and without ultrasound.',
    '→ Medir o óleo na água à saída, em ensaio de bancada e depois piloto.': '→ Measure the oil in the water at the outlet, in a bench test and then a pilot.',
    'Óleo: Crude médio · ρ = 900 kg/m³ · c = 1450 m/s (valores a confirmar)': 'Oil: medium crude · ρ = 900 kg/m³ · c = 1450 m/s (values to be confirmed)'
  });

  // ---------------- ecrã táctil
  add({
    'Toca para começar': 'Tap to start', 'Toca no ecrã para sair': 'Tap the screen to exit',
    'Joystick à esquerda para andar · arrasta à direita para olhar · botões à direita. Melhor com o telemóvel na horizontal.': 'Joystick on the left to walk · drag on the right to look · buttons on the right. Best with the phone in landscape.',
    'Roda o telemóvel para a horizontal': 'Rotate your phone to landscape',
    'ampliar': 'zoom', 'fechar': 'close', 'saltar': 'skip', 'continuar': 'continue', 'idioma': 'language', 'som': 'sound', 'ecrã inteiro': 'full screen',
    'Joystick (esquerda)': 'Joystick (left)', 'andar · arrasta mais para correr': 'walk · push further to run', 'Arrastar à direita': 'Drag on the right', 'olhar à volta': 'look around',
    'abrir o painel que estás a olhar · confirmar': 'open the panel you are looking at · confirm', 'ligar / desligar o método acústico': 'switch the acoustic method on / off', 'tirar / guardar o tablet': 'take out / put away the tablet',
    'fechar / voltar': 'close / go back', 'painel anterior / seguinte': 'previous / next panel', 'escolher e ajustar valores': 'choose and adjust values', 'apresentação guiada': 'guided presentation', 'fotografia (guarda uma imagem)': 'photo (saves an image)',
    'Ajuda e opções': 'Help and options', 'ligado': 'on', 'desligado': 'off'
  });

  // ---------------- regras para textos com números
  const R = I.R, rr = (re, to) => R.push([re, to]);
  rr(/^D50 à saída (.+) \(entrada ≈ 9 µm\)$/, 'D50 at outlet $1 (inlet ≈ 9 µm)');
  rr(/^(\d+) % captado$/, '$1 % captured');
  rr(/^5 períodos · 1 período = (.+) µs reais$/, '5 periods · 1 period = $1 µs real');
  rr(/^agora: ΔT = (.+) K · ganho (\d+) %$/, 'now: ΔT = $1 K · gain $2 %');
  rr(/^antinodos a cada λ\/2 = (.+)$/, 'antinodes every λ/2 = $1');
  rr(/^camadas ampliadas (\d+)× · fora de escala$/, 'layers magnified $1× · not to scale');
  rr(/^espera (\d+)\/40 gotas$/, 'waiting for $1/40 droplets');
  rr(/^u = (.+) m\/s \(esquemático\)$/, 'u = $1 m/s (schematic)');
  rr(/^Nesta simulação: ×(.+) mais óleo captado$/, 'In this simulation: ×$1 more oil captured');
  rr(/^PERGUNTA (\d+) DE (\d+)$/, 'QUESTION $1 OF $2');
  rr(/^Hipóteses de escala: módulo de (.+) m², rendimento (\d+) %, reflexão (.+)\. Ver painel «Limites»\.$/, 'Scale assumptions: $1 m² module, $2 % efficiency, $3 reflection. See the "Limits" panel.');
  rr(/^Cenário: (.+)$/, (m, t) => 'Scenario: ' + t(m[1]));
  rr(/^(\d) · (.+)$/, (m, t) => m[1] + ' · ' + t(m[2]));
  rr(/^(\d+) · comparar$/, '$1 · compare');
  rr(/^Foto guardada: (.+)$/, 'Photo saved: $1');
  rr(/^D50 (\d+) µm$/, 'D50 $1 µm');

  I.t = function (s) {
    if (typeof s !== 'string' || !s) return s;
    if (I.coletar) I.vistos.add(s);
    if (I.lang === 'pt') return s;
    let out = D[s];
    if (out === undefined) { out = s; for (const r of R) { const m = s.match(r[0]); if (m) { out = typeof r[1] === 'function' ? r[1](m, I.t) : s.replace(r[0], r[1]); break; } } }
    return out.replace(/(\d),(\d)/g, '$1.$2');
  };
  I.dom = function () {
    document.querySelectorAll('[data-i18n]').forEach((el) => { if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML; el.innerHTML = I.lang === 'pt' ? el.dataset.pt : I.t(el.dataset.pt); });
    document.title = I.lang === 'en' ? 'COALESCER · 3D simulator' : 'COALESCER · simulador 3D';
  };
  root.I18N = I;
})(window);
