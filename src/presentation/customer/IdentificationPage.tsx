import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { identificationSchema, type IdentificationInput } from '../../application/customer/schemas'
import { maskCpf } from '../../domain/customer/cpf'
import { maskPhone } from '../../domain/customer/phone'
import { maskZipCode } from '../../domain/customer/zipCode'
import { useCart } from '../cart/useCart'
import { useOrderType } from '../order/useOrderType'
import { useCurrentStore } from '../store/useCurrentStore'
import { CheckoutHeader } from '../shared/CheckoutHeader'
import { FixedBottomBar } from '../shared/FixedBottomBar'
import { PageShell } from '../shared/PageShell'
import { fieldClass, fieldLabelClass, primaryButtonClass, stepTitleClass } from '../shared/ui'
import { useCustomer } from './useCustomer'

const LABEL = fieldLabelClass
const INPUT = fieldClass
const ERROR = 'text-[13px] text-danger'

export function IdentificationPage() {
  const store = useCurrentStore()
  const orderType = useOrderType((state) => state.orderType)
  const salesChannel = useOrderType((state) => state.salesChannel)
  const tableNumber = useOrderType((state) => state.tableNumber)
  const setOrderType = useOrderType((state) => state.setOrderType)
  const setTableNumber = useOrderType((state) => state.setTableNumber)
  const items = useCart((state) => state.items)
  const customer = useCustomer((state) => state.customer)
  const setCustomer = useCustomer((state) => state.setCustomer)
  const navigate = useNavigate()

  // pickup e delivery viraram uma escolha só, feita aqui (não mais na tela de tipo
  // de pedido) — só mostra o toggle se a loja aceitar os dois. Se só aceitar um,
  // orderType já chega resolvido (OrderTypeSelectionPage) e não pergunta de novo.
  // Revendedor nunca recebe em casa — só retira no local, então nem o toggle aparece.
  const showFulfillmentToggle =
    salesChannel === 'retail' && orderType !== 'dine_in' && store.supportsPickup && store.supportsDelivery

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IdentificationInput>({
    resolver: zodResolver(identificationSchema(orderType ?? 'pickup')),
    // nome/CPF/telefone reaproveitados de pedido anterior — endereço nunca
    // vem pré-preenchido, é sempre pedido de novo pra ficar atualizado.
    defaultValues: {
      fullName: customer?.fullName ?? '',
      cpf: customer?.cpf ? maskCpf(customer.cpf) : '',
      phone: customer?.phone ? maskPhone(customer.phone) : '',
      // vem preenchido quando o cliente entrou via QR code da mesa (TableEntryPage);
      // continua editável — cliente pode corrigir se o QR leu errado.
      tableNumber: tableNumber ?? '',
      // orderType só chega 'delivery' quando a loja não aceita pickup (toggle
      // nem aparece nesse caso) — cobre a entrega forçada sem pedir de novo.
      wantsDelivery: salesChannel === 'retail' && orderType === 'delivery',
    },
  })

  const { onChange: onCpfChange, ...cpfField } = register('cpf')
  const { onChange: onPhoneChange, ...phoneField } = register('phone')
  const wantsDelivery = watch('wantsDelivery')
  // Só registra quando o campo existe de fato — registrar incondicionalmente faz o
  // RHF criar `address` mesmo sem entrega escolhida, e o Zod para de tratá-lo como
  // opcional (undefined), validando os outros campos obrigatórios do endereço à toa.
  const zipCodeField = wantsDelivery ? register('address.zipCode') : null

  // RHF não desregistra os campos do fieldset de endereço ao desmontar
  // (shouldUnregister é false por padrão) — sem isso, alternar pra "Receber em
  // casa" e voltar pra "Retirar no balcão" deixa `address` com valores vazios
  // presos no form. O Zod trata `address` presente (mesmo vazio) como objeto a
  // validar por inteiro, mesmo sendo `.optional()`, e o submit falha em
  // silêncio (campos com erro ficam escondidos, cliente não vê nada acontecer).
  useEffect(() => {
    if (!wantsDelivery) setValue('address', undefined)
  }, [wantsDelivery, setValue])

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
    if (orderType === 'pickup' || orderType === 'delivery') {
      setOrderType(salesChannel === 'retail' && input.wantsDelivery ? 'delivery' : 'pickup')
    }
    navigate(`/${store.slug}/revisao`)
  }

  return (
    <PageShell>
      <CheckoutHeader current="Seus dados" onBack={() => navigate(`/${store.slug}/carrinho`)} backLabel="Voltar para a sacola" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-5 pb-36" noValidate>
        <div className="mb-1 flex flex-col gap-1">
          <h1 className={stepTitleClass}>Seus dados</h1>
          <p className="text-[15px] text-muted">
            {customer ? 'Confira se está tudo certo.' : 'A gente guarda neste celular para o próximo pedido.'}
          </p>
        </div>
        <label className={LABEL}>
          Nome completo
          <input
            type="text"
            autoComplete="name"
            placeholder="Nome e sobrenome"
            className={INPUT}
            {...register('fullName')}
          />
          {errors.fullName && <span className={ERROR}>{errors.fullName.message}</span>}
        </label>
        <label className={LABEL}>
          CPF
          <input
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
            className={INPUT}
            {...cpfField}
            onChange={(event) => {
              event.target.value = maskCpf(event.target.value)
              onCpfChange(event)
            }}
          />
          {errors.cpf && <span className={ERROR}>{errors.cpf.message}</span>}
        </label>
        {orderType !== 'dine_in' && (
          <label className={LABEL}>
            Telefone
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(00) 0 0000-0000"
              maxLength={16}
              className={INPUT}
              {...phoneField}
              onChange={(event) => {
                event.target.value = maskPhone(event.target.value)
                onPhoneChange(event)
              }}
            />
            {errors.phone && <span className={ERROR}>{errors.phone.message}</span>}
          </label>
        )}

        {orderType === 'dine_in' && (
          <label className={LABEL}>
            Número da mesa
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 12"
              className={INPUT}
              {...register('tableNumber')}
            />
            {errors.tableNumber && (
              <span className={ERROR}>{errors.tableNumber.message}</span>
            )}
          </label>
        )}

        {showFulfillmentToggle && (
          <div className={`flex flex-col gap-1.5 ${LABEL}`}>
            Como você quer receber?
            <div className="flex gap-1 rounded-[16px] bg-surface-2 p-1" role="radiogroup" aria-label="Retirar ou receber">
              <button
                type="button"
                role="radio"
                aria-checked={!wantsDelivery}
                onClick={() => setValue('wantsDelivery', false)}
                className={`h-11 flex-1 rounded-[12px] text-[15px] font-semibold transition-colors ${
                  !wantsDelivery ? 'bg-caramel text-on-caramel' : 'text-muted'
                }`}
              >
                Retirar no balcão
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!!wantsDelivery}
                onClick={() => setValue('wantsDelivery', true)}
                className={`h-11 flex-1 rounded-[12px] text-[15px] font-semibold transition-colors ${
                  wantsDelivery ? 'bg-caramel text-on-caramel' : 'text-muted'
                }`}
              >
                Receber em casa
              </button>
            </div>
          </div>
        )}

        {wantsDelivery && (
          <fieldset className="flex min-w-0 flex-col gap-4 pt-2">
            <legend className="mb-3 font-display text-[22px] font-bold">Endereço de entrega</legend>
            <label className={LABEL}>
              Rua
              <input type="text" className={INPUT} {...register('address.street')} />
              {errors.address?.street && (
                <span className={ERROR}>{errors.address.street.message}</span>
              )}
            </label>
            <div className="flex gap-3">
              <label className={`min-w-0 flex-1 ${LABEL}`}>
                Número
                <input type="text" className={INPUT} {...register('address.number')} />
                {errors.address?.number && (
                  <span className={ERROR}>{errors.address.number.message}</span>
                )}
              </label>
              <label className={`min-w-0 flex-1 ${LABEL}`}>
                Complemento
                <input type="text" className={INPUT} {...register('address.complement')} />
              </label>
            </div>
            <label className={LABEL}>
              Bairro
              <input type="text" className={INPUT} {...register('address.neighborhood')} />
              {errors.address?.neighborhood && (
                <span className={ERROR}>
                  {errors.address.neighborhood.message}
                </span>
              )}
            </label>
            <div className="flex gap-3">
              <label className={`min-w-0 flex-1 ${LABEL}`}>
                Cidade
                <input type="text" className={INPUT} {...register('address.city')} />
                {errors.address?.city && (
                  <span className={ERROR}>{errors.address.city.message}</span>
                )}
              </label>
              <label className={`w-20 ${LABEL}`}>
                UF
                <input type="text" maxLength={2} className={`uppercase ${INPUT}`} {...register('address.state')} />
                {errors.address?.state && (
                  <span className={ERROR}>{errors.address.state.message}</span>
                )}
              </label>
            </div>
            <label className={LABEL}>
              CEP
              <input
                type="text"
                inputMode="numeric"
                placeholder="00000-000"
                maxLength={9}
                className={INPUT}
                {...zipCodeField}
                onChange={(event) => {
                  event.target.value = maskZipCode(event.target.value)
                  zipCodeField?.onChange(event)
                }}
              />
              {errors.address?.zipCode && (
                <span className={ERROR}>{errors.address.zipCode.message}</span>
              )}
            </label>
          </fieldset>
        )}

        <FixedBottomBar>
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            Continuar
          </button>
        </FixedBottomBar>
      </form>
    </PageShell>
  )
}
