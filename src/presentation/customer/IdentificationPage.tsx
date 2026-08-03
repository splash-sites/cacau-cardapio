import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { identificationSchema, type IdentificationInput } from '../../application/customer/schemas'
import { maskCpf } from '../../domain/customer/cpf'
import { maskPhone } from '../../domain/customer/phone'
import { maskZipCode } from '../../domain/customer/zipCode'
import { useCart } from '../cart/useCart'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { PageShell } from '../shared/PageShell'
import { useCustomer } from './useCustomer'

const LABEL = 'font-body text-xs font-bold uppercase tracking-wide text-secondary'
const INPUT =
  'h-11 rounded-xl border border-secondary/15 bg-white px-3 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export function IdentificationPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const setTableNumber = useOrderType((state) => state.setTableNumber)
  const items = useCart((state) => state.items)
  const customer = useCustomer((state) => state.customer)
  const setCustomer = useCustomer((state) => state.setCustomer)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdentificationInput>({
    resolver: zodResolver(identificationSchema(orderType ?? 'pickup')),
    // nome/CPF/telefone reaproveitados de pedido anterior — endereço nunca
    // vem pré-preenchido, é sempre pedido de novo pra ficar atualizado.
    defaultValues: {
      fullName: customer?.fullName ?? '',
      cpf: customer?.cpf ? maskCpf(customer.cpf) : '',
      phone: customer?.phone ? maskPhone(customer.phone) : '',
    },
  })

  const { onChange: onCpfChange, ...cpfField } = register('cpf')
  const { onChange: onPhoneChange, ...phoneField } = register('phone')
  // Só registra quando o campo existe de fato (delivery) — registrar incondicionalmente
  // faz o RHF criar `address` mesmo em dine_in/pickup, e o Zod para de tratá-lo como
  // opcional (undefined), validando os outros campos obrigatórios do endereço à toa.
  const zipCodeField = orderType === 'delivery' ? register('address.zipCode') : null

  if (!orderType) return <Navigate to={`/${store.slug}`} replace />
  if (items.length === 0) return <Navigate to={`/${store.slug}/cardapio`} replace />

  const onSubmit = (input: IdentificationInput) => {
    setCustomer({
      fullName: input.fullName,
      cpf: input.cpf,
      phone: input.phone,
      address: input.address ?? null,
    })
    if (input.tableNumber) setTableNumber(input.tableNumber)
    navigate(`/${store.slug}/revisao`)
  }

  return (
    <PageShell className="text-foreground">
      <div className="flex items-center gap-2 bg-accent px-4 py-4 text-background">
        <button
          type="button"
          onClick={() => navigate(`/${store.slug}/carrinho`)}
          aria-label="Voltar pro carrinho"
          className="flex h-11 w-11 min-h-11 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="font-display text-xl">Seus dados</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 py-6" noValidate>
        <label className={`flex flex-col gap-1 ${LABEL}`}>
          Nome completo
          <input
            type="text"
            autoComplete="name"
            placeholder="Nome e sobrenome"
            className={`normal-case ${INPUT}`}
            {...register('fullName')}
          />
          {errors.fullName && <span className="font-body text-xs font-normal normal-case text-red-600">{errors.fullName.message}</span>}
        </label>
        <label className={`flex flex-col gap-1 ${LABEL}`}>
          CPF
          <input
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
            className={`normal-case ${INPUT}`}
            {...cpfField}
            onChange={(event) => {
              event.target.value = maskCpf(event.target.value)
              onCpfChange(event)
            }}
          />
          {errors.cpf && <span className="font-body text-xs font-normal normal-case text-red-600">{errors.cpf.message}</span>}
        </label>
        <label className={`flex flex-col gap-1 ${LABEL}`}>
          Telefone
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 0 0000-0000"
            maxLength={16}
            className={`normal-case ${INPUT}`}
            {...phoneField}
            onChange={(event) => {
              event.target.value = maskPhone(event.target.value)
              onPhoneChange(event)
            }}
          />
          {errors.phone && <span className="font-body text-xs font-normal normal-case text-red-600">{errors.phone.message}</span>}
        </label>

        {orderType === 'dine_in' && (
          <label className={`flex flex-col gap-1 ${LABEL}`}>
            Número da mesa
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 12"
              className={`normal-case ${INPUT}`}
              {...register('tableNumber')}
            />
            {errors.tableNumber && (
              <span className="font-body text-xs font-normal normal-case text-red-600">{errors.tableNumber.message}</span>
            )}
          </label>
        )}

        {orderType === 'delivery' && (
          <fieldset className="flex min-w-0 flex-col gap-4 rounded-xl border border-secondary/15 bg-white/40 p-3">
            <legend className="px-1 font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Endereço de entrega
            </legend>
            <label className={`flex flex-col gap-1 ${LABEL}`}>
              Rua
              <input type="text" className={`normal-case ${INPUT}`} {...register('address.street')} />
              {errors.address?.street && (
                <span className="font-body text-xs font-normal normal-case text-red-600">{errors.address.street.message}</span>
              )}
            </label>
            <div className="flex gap-3">
              <label className={`flex min-w-0 flex-1 flex-col gap-1 ${LABEL}`}>
                Número
                <input type="text" className={`normal-case ${INPUT}`} {...register('address.number')} />
                {errors.address?.number && (
                  <span className="font-body text-xs font-normal normal-case text-red-600">{errors.address.number.message}</span>
                )}
              </label>
              <label className={`flex min-w-0 flex-1 flex-col gap-1 ${LABEL}`}>
                Complemento
                <input type="text" className={`normal-case ${INPUT}`} {...register('address.complement')} />
              </label>
            </div>
            <label className={`flex flex-col gap-1 ${LABEL}`}>
              Bairro
              <input type="text" className={`normal-case ${INPUT}`} {...register('address.neighborhood')} />
              {errors.address?.neighborhood && (
                <span className="font-body text-xs font-normal normal-case text-red-600">
                  {errors.address.neighborhood.message}
                </span>
              )}
            </label>
            <div className="flex gap-3">
              <label className={`flex min-w-0 flex-1 flex-col gap-1 ${LABEL}`}>
                Cidade
                <input type="text" className={`normal-case ${INPUT}`} {...register('address.city')} />
                {errors.address?.city && (
                  <span className="font-body text-xs font-normal normal-case text-red-600">{errors.address.city.message}</span>
                )}
              </label>
              <label className={`flex w-20 flex-col gap-1 ${LABEL}`}>
                UF
                <input type="text" maxLength={2} className={`normal-case uppercase ${INPUT}`} {...register('address.state')} />
                {errors.address?.state && (
                  <span className="font-body text-xs font-normal normal-case text-red-600">{errors.address.state.message}</span>
                )}
              </label>
            </div>
            <label className={`flex flex-col gap-1 ${LABEL}`}>
              CEP
              <input
                type="text"
                inputMode="numeric"
                placeholder="00000-000"
                maxLength={9}
                className={`normal-case ${INPUT}`}
                {...zipCodeField}
                onChange={(event) => {
                  event.target.value = maskZipCode(event.target.value)
                  zipCodeField?.onChange(event)
                }}
              />
              {errors.address?.zipCode && (
                <span className="font-body text-xs font-normal normal-case text-red-600">{errors.address.zipCode.message}</span>
              )}
            </label>
          </fieldset>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 min-h-11 rounded-full bg-primary font-body font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
        >
          Confirmar
        </button>
      </form>
    </PageShell>
  )
}
