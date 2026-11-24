import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  acceptRentalContract,
  createRentCheckout,
  createRentalContract,
  getMercadoPagoConnection,
  getOwnedRentalListings,
  getPaymentTransactionStatus,
  getRentalContracts,
  getAccessToken,
  rejectRentalContract,
  startMercadoPagoConnection,
  terminateRentalContract,
} from "../services/api.js";
import "./RentPaymentPage.css";

const contractLabels = {
  PENDING: "Aguardando aceite",
  ACTIVE: "Ativo",
  REJECTED: "Recusado",
  TERMINATED: "Encerrado",
};
const paymentLabels = {
  PENDING: "Aguardando confirmação",
  PAID: "Pagamento aprovado",
  REJECTED: "Pagamento recusado",
  OVERDUE: "Em atraso",
  CANCELLED: "Pagamento cancelado",
  REFUNDED: "Pagamento estornado",
};

function formatCurrency(amountInCents) {
  return (amountInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function monthOf(date) {
  return date.slice(0, 7);
}

export function RentPaymentPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts, setContracts] = useState([]);
  const [listings, setListings] = useState([]);
  const [connection, setConnection] = useState({
    canManageContracts: false,
    connected: false,
    platformFeePercent: 5,
  });
  const [selectedContractId, setSelectedContractId] = useState("");
  const [period, setPeriod] = useState(currentMonth);
  const [tenantEmail, setTenantEmail] = useState("");
  const [listingId, setListingId] = useState("");
  const [startsAt, setStartsAt] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [endsAt, setEndsAt] = useState("");
  const [dueDay, setDueDay] = useState("5");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [statusError, setStatusError] = useState("");

  const transactionId = searchParams.get("transaction");
  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextContracts, nextListings, nextConnection] = await Promise.all([
        getRentalContracts(),
        getOwnedRentalListings(),
        getMercadoPagoConnection(),
      ]);
      setContracts(nextContracts);
      setListings(nextListings);
      setConnection(nextConnection);
      setSelectedContractId((selected) => {
        if (nextContracts.some((contract) => contract.id === selected))
          return selected;
        return (
          nextContracts.find(
            (contract) =>
              contract.currentUserIsTenant && contract.status === "ACTIVE",
          )?.id ?? ""
        );
      });
      setListingId((selected) =>
        nextListings.some((listing) => listing.id === selected)
          ? selected
          : (nextListings[0]?.id ?? ""),
      );
    } catch (requestError) {
      setError(
        requestError.message || "Não foi possível carregar os pagamentos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login", {
        replace: true,
        state: { from: "/pagamento-aluguel" },
      });
      return;
    }
    loadPage();
  }, [loadPage, navigate]);

  useEffect(() => {
    const connectionResult = searchParams.get("mercadopago");
    if (connectionResult === "connected") {
      setNotice(
        "Conta Mercado Pago conectada. Você já pode receber pagamentos.",
      );
    } else if (connectionResult === "cancelled") {
      setNotice("A conexão com o Mercado Pago foi cancelada.");
    }
    if (connectionResult) {
      const next = new URLSearchParams(searchParams);
      next.delete("mercadopago");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!transactionId) {
      setPaymentResult(null);
      setStatusError("");
      return undefined;
    }

    let active = true;
    let timeout;
    let attempts = 0;
    setPaymentResult(null);
    setStatusError("");

    async function refreshStatus() {
      try {
        const status = await getPaymentTransactionStatus(transactionId);
        if (!active) return;
        setPaymentResult(status);
        if (status.status === "PENDING" && attempts < 10) {
          attempts += 1;
          timeout = window.setTimeout(refreshStatus, 2500);
        }
      } catch (requestError) {
        if (active) setStatusError(requestError.message);
      }
    }

    refreshStatus();
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [transactionId]);

  const paymentContracts = contracts.filter(
    (contract) =>
      contract.currentUserIsTenant &&
      contract.status === "ACTIVE" &&
      monthOf(contract.startsAt) <= currentMonth() &&
      (!contract.endsAt || monthOf(contract.endsAt) >= currentMonth()),
  );
  const selectedContract = paymentContracts.find(
    (contract) => contract.id === selectedContractId,
  );
  const rentAmount = selectedContract?.monthlyRentInCents ?? 0;
  const feePercent = connection.platformFeePercent;
  const feeAmount = Math.round((rentAmount * feePercent) / 100);
  const totalAmount = rentAmount + feeAmount;
  const periodMin = selectedContract
    ? monthOf(selectedContract.startsAt)
    : currentMonth();
  const periodMax =
    selectedContract?.endsAt &&
    monthOf(selectedContract.endsAt) < currentMonth()
      ? monthOf(selectedContract.endsAt)
      : currentMonth();

  async function handleConnectMercadoPago() {
    setWorking("connect");
    setError("");
    try {
      const authorizationUrl = await startMercadoPagoConnection();
      window.location.assign(authorizationUrl);
    } catch (requestError) {
      setError(requestError.message);
      setWorking("");
    }
  }

  async function handleCreateContract(event) {
    event.preventDefault();
    setWorking("contract");
    setError("");
    setNotice("");
    try {
      await createRentalContract({
        listingId,
        tenantEmail,
        startsAt,
        ...(endsAt ? { endsAt } : {}),
        dueDay: Number(dueDay),
      });
      setTenantEmail("");
      setNotice(
        "Convite enviado. O contrato ficará ativo após o aceite do inquilino.",
      );
      await loadPage();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking("");
    }
  }

  async function handleContractDecision(contractId, action) {
    setWorking(contractId);
    setError("");
    try {
      if (action === "accept") await acceptRentalContract(contractId);
      else if (action === "reject") await rejectRentalContract(contractId);
      else await terminateRentalContract(contractId);
      await loadPage();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking("");
    }
  }

  async function handleCheckout(event) {
    event.preventDefault();
    if (!selectedContract) return;
    setWorking("checkout");
    setError("");
    try {
      const checkout = await createRentCheckout({
        contractId: selectedContract.id,
        period,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (requestError) {
      setError(requestError.message);
      setWorking("");
    }
  }

  return (
    <div className="rent-payment-page">
      <header className="rent-payment-header">
        <Link to="/" className="rent-payment-brand" aria-label="Moraê, início">
          moraê<span>.</span>
        </Link>
        <nav aria-label="Navegação de pagamentos">
          <Link to="/ofertante/pagamentos">Histórico financeiro</Link>
          <Link to="/perfil">Minha conta</Link>
        </nav>
      </header>

      <div className="rent-payment-main">
        <section className="rent-payment-hero">
          <span className="rent-payment-icon" aria-hidden="true">
            $
          </span>
          <div>
            <p className="rent-payment-eyebrow">MORADIA EM DIA</p>
            <h1>Pagamento do aluguel</h1>
            <p>
              Consulte seus contratos e pague com segurança pelo Mercado Pago.
            </p>
          </div>
          <span className="rent-payment-hero-orbit" aria-hidden="true" />
        </section>

        {notice && (
          <p className="rent-payment-notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="rent-payment-error" role="alert">
            {error}
          </p>
        )}

        {transactionId && (
          <section className="rent-payment-result" aria-live="polite">
            <div>
              <span
                className={`rent-payment-result-dot ${paymentResult?.status?.toLowerCase() ?? "pending"}`}
              />
              <div>
                <strong>
                  {paymentResult
                    ? paymentLabels[paymentResult.status]
                    : statusError
                      ? "Não foi possível consultar o status"
                      : "Consultando confirmação do pagamento"}
                </strong>
                <p>
                  {paymentResult
                    ? `${paymentResult.description} · ${formatCurrency(paymentResult.amountInCents)}`
                    : statusError ||
                      "A confirmação oficial pode levar alguns instantes."}
                </p>
              </div>
            </div>
            {paymentResult?.status === "PENDING" && (
              <span>Atualizando automaticamente</span>
            )}
          </section>
        )}

        {loading ? (
          <div className="rent-payment-loading" role="status">
            Carregando contratos e opções de pagamento…
          </div>
        ) : (
          <>
            <div className="rent-payment-layout">
              <section className="rent-payment-card rent-checkout-card">
                <div className="rent-payment-section-heading">
                  <span>01</span>
                  <div>
                    <h2>Quitar aluguel</h2>
                    <p>Escolha um contrato ativo e o mês de referência.</p>
                  </div>
                </div>
                {paymentContracts.length ? (
                  <form onSubmit={handleCheckout}>
                    <label className="rent-payment-field">
                      Contrato
                      <select
                        value={selectedContractId}
                        onChange={(event) => {
                          setSelectedContractId(event.target.value);
                          const nextContract = paymentContracts.find(
                            (contract) => contract.id === event.target.value,
                          );
                          if (nextContract) setPeriod(currentMonth());
                        }}
                        required
                      >
                        {paymentContracts.map((contract) => (
                          <option key={contract.id} value={contract.id}>
                            {contract.listingTitle} · {contract.neighborhood}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="rent-payment-field">
                      Mês do aluguel
                      <input
                        type="month"
                        value={period}
                        min={periodMin}
                        max={periodMax}
                        onChange={(event) => setPeriod(event.target.value)}
                        required
                      />
                    </label>
                    {selectedContract && (
                      <div className="rent-payment-breakdown">
                        <div>
                          <span>Aluguel mensal</span>
                          <strong>{formatCurrency(rentAmount)}</strong>
                        </div>
                        <div>
                          <span>Taxa de serviço Moraê ({feePercent}%)</span>
                          <strong>{formatCurrency(feeAmount)}</strong>
                        </div>
                        <div className="rent-payment-total">
                          <span>Total a pagar</span>
                          <strong>{formatCurrency(totalAmount)}</strong>
                        </div>
                      </div>
                    )}
                    {selectedContract &&
                      !selectedContract.ownerMercadoPagoConnected && (
                        <p
                          className="rent-payment-inline-warning"
                          role="status"
                        >
                          O proprietário ainda não conectou a conta Mercado Pago
                          para receber este aluguel.
                        </p>
                      )}
                    <div
                      className="rent-payment-methods"
                      aria-label="Formas disponíveis no Mercado Pago"
                    >
                      <span>Pix</span>
                      <span>Cartão</span>
                      <span>Boleto</span>
                    </div>
                    <button
                      className="rent-payment-primary"
                      type="submit"
                      disabled={
                        working !== "" ||
                        !selectedContract?.ownerMercadoPagoConnected ||
                        !period
                      }
                    >
                      {working === "checkout"
                        ? "Preparando checkout…"
                        : "Continuar para pagamento"}
                    </button>
                    <p className="rent-payment-secure-note">
                      Você pagará em uma página segura do Mercado Pago. O Moraê
                      não armazena dados do cartão.
                    </p>
                  </form>
                ) : (
                  <div className="rent-payment-empty">
                    <strong>Nenhum contrato ativo para pagar</strong>
                    <p>
                      O pagamento só fica disponível depois que proprietário e
                      inquilino aceitarem o contrato.
                    </p>
                  </div>
                )}
              </section>

              {connection.canManageContracts && (
                <section className="rent-payment-card rent-connection-card">
                  <div className="rent-payment-section-heading">
                    <span>02</span>
                    <div>
                      <h2>Receber pagamentos</h2>
                      <p>Conecte a conta do proprietário.</p>
                    </div>
                  </div>
                  <div
                    className={`rent-payment-connection ${connection.connected ? "is-connected" : ""}`}
                  >
                    <span className="rent-payment-connection-indicator" />
                    <div>
                      <strong>
                        {connection.connected
                          ? "Conta conectada"
                          : "Conta não conectada"}
                      </strong>
                      <p>
                        {connection.connected
                          ? "Os pagamentos são encaminhados à conta conectada."
                          : "Conecte sua conta Mercado Pago para receber."}
                      </p>
                    </div>
                  </div>
                  {!connection.connected && (
                    <button
                      type="button"
                      className="rent-payment-secondary"
                      disabled={working !== ""}
                      onClick={handleConnectMercadoPago}
                    >
                      {working === "connect"
                        ? "Abrindo Mercado Pago…"
                        : "Conectar Mercado Pago"}
                    </button>
                  )}
                  <small>
                    O aceite no aplicativo registra a concordância das partes,
                    mas não substitui a assinatura formal do contrato.
                  </small>
                </section>
              )}
            </div>

            {connection.canManageContracts && (
              <section className="rent-payment-card rent-contract-create">
                <div className="rent-payment-section-heading">
                  <span>03</span>
                  <div>
                    <h2>Convidar inquilino</h2>
                    <p>
                      Crie um contrato de cobrança com base em um anúncio
                      aprovado.
                    </p>
                  </div>
                </div>
                {listings.length ? (
                  <form
                    className="rent-contract-form"
                    onSubmit={handleCreateContract}
                  >
                    <label className="rent-payment-field">
                      Imóvel anunciado
                      <select
                        value={listingId}
                        onChange={(event) => setListingId(event.target.value)}
                        required
                      >
                        {listings.map((listing) => (
                          <option key={listing.id} value={listing.id}>
                            {listing.title} · {listing.neighborhood} ·{" "}
                            {formatCurrency(listing.rentInCents)}/mês
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="rent-payment-field">
                      E-mail do inquilino
                      <input
                        type="email"
                        autoComplete="email"
                        value={tenantEmail}
                        onChange={(event) => setTenantEmail(event.target.value)}
                        placeholder="inquilino@exemplo.com"
                        required
                      />
                    </label>
                    <label className="rent-payment-field">
                      Início da locação
                      <input
                        type="date"
                        value={startsAt}
                        onChange={(event) => setStartsAt(event.target.value)}
                        required
                      />
                    </label>
                    <label className="rent-payment-field">
                      Fim da locação{" "}
                      <span className="rent-field-optional">(opcional)</span>
                      <input
                        type="date"
                        value={endsAt}
                        min={startsAt}
                        onChange={(event) => setEndsAt(event.target.value)}
                      />
                    </label>
                    <label className="rent-payment-field">
                      Vencimento mensal
                      <select
                        value={dueDay}
                        onChange={(event) => setDueDay(event.target.value)}
                      >
                        {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                          <option key={day} value={day}>
                            Dia {day}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="rent-payment-primary"
                      type="submit"
                      disabled={working !== "" || !listingId}
                    >
                      {working === "contract"
                        ? "Enviando convite…"
                        : "Enviar convite de locação"}
                    </button>
                  </form>
                ) : (
                  <p className="rent-payment-empty">
                    Nenhum anúncio mensal aprovado está disponível nesta conta.
                  </p>
                )}
                <p className="rent-contract-legal-note">
                  O aluguel e a taxa exibidos antes do checkout são confirmados
                  pelo servidor. Use este fluxo apenas após acordar formalmente
                  as condições da locação.
                </p>
              </section>
            )}

            <section className="rent-payment-card rent-contract-list">
              <div className="rent-payment-section-heading">
                <span>04</span>
                <div>
                  <h2>Contratos e convites</h2>
                  <p>
                    O contrato fica ativo quando o inquilino aceita o convite.
                  </p>
                </div>
              </div>
              {contracts.length ? (
                <div className="rent-contract-list-items">
                  {contracts.map((contract) => (
                    <article className="rent-contract-item" key={contract.id}>
                      <div className="rent-contract-item-main">
                        <div className="rent-contract-title-row">
                          <h3>{contract.listingTitle}</h3>
                          <span
                            className={`rent-contract-status ${contract.status.toLowerCase()}`}
                          >
                            {contractLabels[contract.status]}
                          </span>
                        </div>
                        <p>
                          {contract.neighborhood}, {contract.city}
                        </p>
                        <div className="rent-contract-meta">
                          <span>
                            {contract.currentUserIsTenant
                              ? "Proprietário"
                              : "Inquilino"}
                            :{" "}
                            {contract.currentUserIsTenant
                              ? contract.ownerName
                              : contract.tenantName}
                          </span>
                          <span>
                            {formatCurrency(contract.monthlyRentInCents)}/mês
                          </span>
                          <span>Vencimento dia {contract.dueDay}</span>
                        </div>
                      </div>
                      {contract.status === "PENDING" &&
                        contract.currentUserIsTenant && (
                          <div className="rent-contract-actions">
                            <button
                              type="button"
                              disabled={working === contract.id}
                              onClick={() =>
                                handleContractDecision(contract.id, "accept")
                              }
                            >
                              Aceitar
                            </button>
                            <button
                              type="button"
                              className="is-muted"
                              disabled={working === contract.id}
                              onClick={() =>
                                handleContractDecision(contract.id, "reject")
                              }
                            >
                              Recusar
                            </button>
                          </div>
                        )}
                      {contract.status === "ACTIVE" &&
                        !contract.currentUserIsTenant && (
                          <button
                            type="button"
                            className="rent-contract-terminate"
                            disabled={working === contract.id}
                            onClick={() =>
                              handleContractDecision(contract.id, "terminate")
                            }
                          >
                            Encerrar
                          </button>
                        )}
                      {contract.status === "ACTIVE" &&
                        contract.currentUserIsTenant &&
                        !contract.ownerMercadoPagoConnected && (
                          <span className="rent-contract-waiting">
                            Aguardando conexão de recebimento do proprietário
                          </span>
                        )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rent-payment-empty">
                  <strong>Você ainda não tem contratos registrados</strong>
                  <p>Convites e contratos ativos aparecerão aqui.</p>
                </div>
              )}
              <p className="rent-contract-legal-note">
                O registro de aceite nesta plataforma não é uma assinatura
                eletrônica nem substitui um contrato formal assinado pelas
                partes.
              </p>
            </section>
          </>
        )}
      </div>
      <footer className="rent-payment-footer">
        <span>Moraê · Pagamentos processados pelo Mercado Pago</span>
        <Link to="/ofertante/pagamentos">Ver histórico financeiro</Link>
      </footer>
    </div>
  );
}
