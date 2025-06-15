const { chromium } = require('playwright');

(async () => {
  const time = "Botafogo-RJ";
  const timeRival = "Seattle Sounders FC";
  const odd = 3.7;
  const oddStr = odd.toString();

  const jogoCompleto = `${time} - ${timeRival} | Jogos`;
  const query = `${time} ${timeRival}`;

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("⏳ Acessando Betano...");
    await page.goto('https://www.betano.bet.br/', { timeout: 60000 });

    // ✅ Aceitação de idade
    try {
      const botaoIdade = page.locator('div:has-text("VOCÊ TEM MAIS DE 18 ANOS?") >> button:has-text("SIM")');
      await botaoIdade.waitFor({ timeout: 10000 });
      await botaoIdade.click();
      console.log("🔞 Idade confirmada.");
    } catch {
      console.log("🔞 Nenhum popup de idade encontrado.");
    }

    // ✅ Aceitação de cookies
    const botaoCookies = page.locator('button:has-text("SIM, EU ACEITO")');
    if (await botaoCookies.isVisible()) {
      await botaoCookies.click();
      console.log("🍪 Cookies aceitos.");
    }

    // ✅ Fechamento do modal de login
    try {
      const botaoFecharModal = page.locator('button.sb-modal__close__btn');
      await botaoFecharModal.waitFor({ timeout: 7000 });
      await botaoFecharModal.click();
      console.log("🚪 Modal fechado.");
    } catch {
      console.log("✅ Nenhum modal para fechar.");
    }

    // 🔍 Busca pelo jogo
    const botaoBusca = page.locator('svg[data-qa="header-icons-search-icon"]');
    await botaoBusca.waitFor({ timeout: 10000 });
    await botaoBusca.click();
    await page.fill('input[type="search"]', query);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    const jogo = page.locator('div.search-result').filter({
      has: page.locator(`div.search-result__info__name:has-text("${jogoCompleto}")`)
    });
    await jogo.first().waitFor({ timeout: 10000 });
    await jogo.first().click();
    console.log("🎯 Jogo acessado.");

    await page.waitForTimeout(5000);

    // ✅ Navega até a aba Handicap
    const abaHandicap = page.locator('div[data-qa="handicap"]');
    await abaHandicap.waitFor({ timeout: 10000 });
    await abaHandicap.click();
    console.log("🧭 Acessou aba Handicap.");
    await page.waitForTimeout(4000);

    // ✅ Busca a odd exata na linha -1 do time da casa (esquerda)
    const casaMenosUm = page.locator(
      `div[data-qa="event-selection"][aria-label*="${time}"][aria-label*="-1"]`
    );
    await casaMenosUm.first().waitFor({ timeout: 10000 });

    const valorReal = await casaMenosUm.first().innerText();
    const encontrou = valorReal.trim() === oddStr;

    console.log(`\nOdd pesquisada: ${oddStr}`);
    console.log(`Odd pesquisada encontrada: ${encontrou}`);
    console.log(`Odd exibida na linha -1 do time da casa: ${valorReal.trim()}`);

    await browser.close();

  } catch (err) {
    console.error("⚠️ Erro:", err.message);
    await browser.close();
  }
})();
