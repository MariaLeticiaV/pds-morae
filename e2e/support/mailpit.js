// Leitura dos e-mails que o backend de teste enviou de verdade para o Mailpit
// (docker compose do morae-backend).
import { mailpitUrl } from './environment.js';

async function mailpit(path, init) {
  const response = await fetch(`${mailpitUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(`Mailpit respondeu ${response.status} em ${path}.`);
  }
  return response;
}

async function messagesTo(address) {
  const response = await mailpit('/api/v1/messages?limit=200');
  const { messages } = await response.json();
  return messages.filter((message) =>
    message.To.some((recipient) => recipient.Address === address),
  );
}

// Apaga só os e-mails deste destinatário, sem mexer nos de desenvolvimento.
export async function deleteMessagesTo(address) {
  const ids = (await messagesTo(address)).map((message) => message.ID);
  if (ids.length === 0) return;
  await mailpit('/api/v1/messages', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ IDs: ids }),
  });
}

// O backend envia o e-mail depois de responder, então espera ele chegar.
export async function waitForLinkIn(address, pathname, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  const pattern = new RegExp(`https?://\\S+${pathname}\\?token=[^\\s>"]+`);

  while (Date.now() < deadline) {
    const [latest] = await messagesTo(address);
    if (latest) {
      const response = await mailpit(`/api/v1/message/${latest.ID}`);
      const { Text } = await response.json();
      const link = pattern.exec(Text)?.[0];
      if (link) return link;
      throw new Error(`O e-mail para ${address} não tem link para ${pathname}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Nenhum e-mail chegou para ${address} em ${timeoutMs} ms.`);
}
