#!/usr/bin/env python3
"""Fonte dos 100 padrões de conexão por cenário. Gera o bloco `patterns` de js/data.js.
Uso (da raiz do projeto): python3 tools/patterns_src.py
Cada item: (cenário, categoria, padrão, original, grafia conectada, texto falado ou None, tradução, dica)
[colchetes] marcam as partes que se ligam (mesma quantidade em original e grafia)."""
import json
import pathlib
import re

CV = ("Consoante + Vogal", "C + V")
FL = ("Flap T", "T/D em som de R")
YL = ("Junção com Y", "D/T + you → dj/ch")
WK = ("Palavra fraca", "to/of/for encolhem")
HM = ("H mudo", "him/her/have perdem o H")


def RD(p):
    return ("Redução", p)


T = []


def add(cen, cat, orig, resp, fast, pt, tip):
    T.append((cen, cat, orig, resp, fast, pt, tip))


# ---------- AEROPORTO (15) ----------
A = "Aeroporto"
add(A, CV, "Can I [check in] here?", "Can I [che-kin] here?", None, "Posso fazer o check-in aqui?", "O K de check passa para o in: che-kin.")
add(A, FL, "[Put it on] the belt, please", "[Pu-di-ton] the belt, please", None, "Coloque na esteira, por favor.", "O T de put vira um R rápido e liga com it on.")
add(A, RD("Going to → Gonna"), "I'm [going to] miss my flight", "I'm [gonna] miss my flight", "I'm gonna miss my flight", "Eu vou perder meu voo.", "Na fala rápida, going to vira gonna.")
add(A, YL, "[Did you] pack this bag?", "[Di-dja] pack this bag?", None, "Você fez esta mala?", "D + you soa como dj: di-dja.")
add(A, WK, "Where's the [gate for] Miami?", "Where's the [gayt fer] Miami?", None, "Onde fica o portão para Miami?", "For fica fraco e soa como fer.")
add(A, CV, "The plane [takes off] at six", "The plane [tay-ksoff] at six", None, "O avião decola às seis.", "O S de takes passa para off: tay-ksoff.")
add(A, FL, "I've got [a lot of] bags", "I've got [a lo-dav] bags", None, "Tenho muitas malas.", "O T de lot vira R e of encolhe para av.")
add(A, HM, "I [gave him] my passport", "I [gay-vim] my passport", None, "Dei meu passaporte a ele.", "O H de him some e o V gruda: gay-vim.")
add(A, RD("Want to → Wanna"), "I [want to] talk to someone", "I [wanna] talk to someone", "I wanna talk to someone", "Quero falar com alguém.", "Want to encolhe para wanna.")
add(A, YL, "[Would you] hold my bag?", "[Wou-dja] hold my bag?", None, "Você pode segurar minha mala?", "D + you soa como dj: wou-dja.")
add(A, CV, "Where do I [pick up] my bags?", "Where do I [pi-kup] my bags?", None, "Onde pego minhas malas?", "O K de pick passa para up.")
add(A, WK, "My bag [is full of] clothes", "My bag [is fool-uv] clothes", None, "Minha mala está cheia de roupas.", "Of encolhe para uv.")
add(A, FL, "I need to [get a] boarding pass", "I need to [ge-da] boarding pass", None, "Preciso de um cartão de embarque.", "O T de get vira R: ge-da.")
add(A, RD("Have to → Hafta / Gotta"), "I [have to] catch my flight", "I [hafta] catch my flight", "I gotta catch my flight", "Tenho que pegar meu voo.", "Have to vira hafta, ou gotta na fala informal.")
add(A, CV, "Please [turn it off]", "Please [tur-ni-toff]", None, "Por favor, desligue.", "As consoantes passam para a vogal seguinte: tur-ni-toff.")

# ---------- SHOPPING (15) ----------
S = "Shopping"
add(S, CV, "Do you have [this in] a medium?", "Do you have [thi-sin] a medium?", None, "Tem este em tamanho M?", "O S de this passa para in: thi-sin.")
add(S, FL, "Can I [try it on]?", "Can I [try-di-ton]?", None, "Posso experimentar?", "O T de it vira R e liga com on.")
add(S, RD("Going to → Gonna"), "I'm [just going to] look around", "I'm [jus-gonna] look around", "I'm just gonna look around", "Só vou dar uma olhada.", "Going to vira gonna.")
add(S, YL, "[What do you] think of this?", "[Wha-dya] think of this?", None, "O que você acha disso?", "What do you soa como wha-dya.")
add(S, CV, "How [much is it]?", "How [muchi-zit]?", None, "Quanto custa?", "As palavras se ligam em uma só: muchi-zit.")
add(S, CV, "[Is it] on sale?", "[I-zit] on sale?", None, "Está em promoção?", "O S de is passa para it: i-zit.")
add(S, RD("Want to → Wanna"), "I [want to] pay with a card", "I [wanna] pay with a card", "I wanna pay with a card", "Quero pagar com cartão.", "Want to vira wanna.")
add(S, FL, "Do you have a [better] one?", "Do you have a [be-der] one?", None, "Tem um melhor?", "O T entre vogais vira R: be-der.")
add(S, FL, "Can I [get a] bag, please?", "Can I [ge-da] bag, please?", None, "Pode me dar uma sacola?", "O T de get vira R: ge-da.")
add(S, RD("Give me → Gimme"), "[Give me] a discount?", "[Gimme] a discount?", "Gimme a discount?", "Me dá um desconto?", "Give me vira gimme.")
add(S, RD("Let me → Lemme"), "[Let me] see that", "[Lemme] see that", "Lemme see that", "Deixa eu ver isso.", "Let me vira lemme.")
add(S, YL, "[Do you] take credit cards?", "[Da-ya] take credit cards?", None, "Vocês aceitam cartão de crédito?", "Do you soa como da-ya.")
add(S, WK, "I'm [looking for] a gift", "I'm [looking fer] a gift", None, "Estou procurando um presente.", "For fica fraco: fer.")
add(S, CV, "[I'll take it]", "[I'll tay-kit]", None, "Vou levar.", "O K de take passa para it: tay-kit.")
add(S, FL, "Where's the [fitting] room?", "Where's the [fi-ding] room?", None, "Onde fica o provador?", "O T entre vogais vira D rápido: fi-ding.")

# ---------- CAFETERIA (14) ----------
C = "Cafeteria"
add(C, WK, "I'd [like a] latte, please", "I'd [lai-ka] latte, please", None, "Quero um latte, por favor.", "Like a se liga: lai-ka.")
add(C, RD("Kind of → Kinda"), "[What kind of] milk do you have?", "[Wha-kinda] milk do you have?", "What kinda milk do you have?", "Que tipo de leite vocês têm?", "Kind of vira kinda.")
add(C, CV, "Can I [have it] with oat milk?", "Can I [ha-vit] with oat milk?", None, "Pode ser com leite de aveia?", "O V de have passa para it: ha-vit.")
add(C, YL, "[Would you] like it hot or iced?", "[Wou-dja] like it hot or iced?", None, "Você quer quente ou gelado?", "D + you soa como dj: wou-dja.")
add(C, FL, "Can I get some [water]?", "Can I get some [wa-der]?", None, "Pode me dar água?", "O T entre vogais vira R: wa-der.")
add(C, WK, "[A cup of] coffee, please", "[A cu-pa] coffee, please", None, "Uma xícara de café, por favor.", "Cup of vira cu-pa.")
add(C, WK, "Is it for here or [to go]?", "Is it for here or [ta go]?", None, "É para aqui ou para viagem?", "To fica fraco: ta.")
add(C, RD("Going to → Gonna"), "I'm [going to] get a bagel", "I'm [gonna] get a bagel", "I'm gonna get a bagel", "Vou pegar um bagel.", "Going to vira gonna.")
add(C, CV, "Can you [make it] extra hot?", "Can you [may-kit] extra hot?", None, "Pode deixar bem quente?", "O K de make passa para it: may-kit.")
add(C, YL, "Did you [get your] drink?", "Did you [ge-chur] drink?", None, "Você pegou sua bebida?", "T + you soa como ch: ge-chur.")
add(C, RD("Don't know → Dunno"), "I [don't know] what to get", "I [dunno] what to get", "I dunno what to get", "Não sei o que pedir.", "Don't know vira dunno.")
add(C, CV, "Can you [put it in] a to-go cup?", "Can you [pu-di-din] a to-go cup?", None, "Pode colocar em copo para viagem?", "O T de put vira R e tudo se liga: pu-di-din.")
add(C, CV, "A [slice of] cake", "A [slai-suv] cake", None, "Uma fatia de bolo.", "O S de slice passa para of: slai-suv.")
add(C, RD("Let me → Lemme"), "[Let me know] if you need anything", "[Lemme-no] if you need anything", "Lemme know if you need anything", "Me avise se precisar de algo.", "Let me vira lemme.")

# ---------- PIZZARIA (14) ----------
P = "Pizzaria"
add(P, WK, "I'd [like to] order a pizza", "I'd [lai-kta] order a pizza", None, "Gostaria de pedir uma pizza.", "Like to vira lai-kta.")
add(P, CV, "[Can I] get a large pepperoni?", "[Ca-nai] get a large pepperoni?", None, "Posso pedir uma grande de pepperoni?", "Can I se liga: ca-nai.")
add(P, FL, "Do you [want it] cut in eight slices?", "Do you [wa-nit] cut in eight slices?", None, "Você quer cortada em oito fatias?", "Want it vira wa-nit.")
add(P, YL, "[Do you] want extra cheese?", "[Dja] want extra cheese?", None, "Quer queijo extra?", "Do you encolhe para dja.")
add(P, RD("Going to → Gonna"), "We're [going to] split it", "We're [gonna] split it", "We're gonna split it", "Vamos dividir.", "Going to vira gonna.")
add(P, CV, "[Take out] the onions", "[Tay-kout] the onions", None, "Tire a cebola.", "O K de take passa para out.")
add(P, FL, "[Eat in] or take out?", "[Ee-din] or take out?", None, "Come aqui ou leva?", "O T de eat vira R e liga com in.")
add(P, FL, "[A lot of] cheese, please", "[A lo-dav] cheese, please", None, "Bastante queijo, por favor.", "O T de lot vira R e of encolhe.")
add(P, CV, "[Pick it up] in twenty minutes", "[Pi-ki-dup] in twenty minutes", None, "Retire em vinte minutos.", "Tudo se liga em uma palavra: pi-ki-dup.")
add(P, RD("Give me → Gimme"), "[Give me] two slices", "[Gimme] two slices", "Gimme two slices", "Me dá duas fatias.", "Give me vira gimme.")
add(P, YL, "Can I [get you] anything else?", "Can I [ge-chu] anything else?", None, "Posso trazer mais alguma coisa?", "T + you soa como ch: ge-chu.")
add(P, CV, "[This is a] great pizza", "[Thi-si-za] great pizza", None, "Esta é uma ótima pizza.", "As palavras se ligam: thi-si-za.")
add(P, HM, "[Give him] the bill", "[Giv-im] the bill", None, "Dê a conta a ele.", "O H de him some: giv-im.")
add(P, CV, "[Can we] get the bill, please?", "[Ca-nwee] get the bill, please?", None, "Pode trazer a conta, por favor?", "Can we soa como ca-nwee.")

# ---------- FESTA DE VIZINHOS (14) ----------
F = "Festa de vizinhos"
add(F, YL, "Nice to [meet you]", "Nice to [mee-chu]", None, "Prazer em conhecer você.", "T + you soa como ch: mee-chu.")
add(F, WK, "[Thanks for] having us", "[Thanks fer] having us", None, "Obrigado por nos receber.", "For fica fraco: fer.")
add(F, YL, "[What do you] do for a living?", "[Wha-dya] do for a living?", None, "Qual é a sua profissão?", "What do you soa como wha-dya.")
add(F, FL, "[What a] nice house!", "[Wha-da] nice house!", None, "Que casa bonita!", "O T de what vira R: wha-da.")
add(F, RD("Have to → Gotta"), "We [have to] get together sometime", "We [hafta] get together sometime", "We gotta get together sometime", "Temos que nos encontrar qualquer hora.", "Have to vira hafta, ou gotta na fala informal.")
add(F, CV, "[Help yourself] to some food", "[Hel-pyourself] to some food", None, "Fique à vontade para comer.", "O P de help passa para yourself.")
add(F, YL, "[How did you] like the food?", "[How di-dja] like the food?", None, "O que achou da comida?", "D + you soa como dj: di-dja.")
add(F, FL, "[Wait a] minute", "[Wai-da] minute", None, "Espera um minuto.", "O T de wait vira R: wai-da.")
add(F, RD("Kind of → Kinda"), "It's [kind of] loud", "It's [kinda] loud", "It's kinda loud", "Está meio alto.", "Kind of vira kinda.")
add(F, CV, "[Come on] in", "[Co-mon] in", None, "Entra aí.", "O M de come passa para on: co-mon.")
add(F, WK, "A [glass of] wine?", "A [gla-suv] wine?", None, "Uma taça de vinho?", "Of encolhe para uv.")
add(F, HM, "[Tell him] to come over", "[Tel-im] to come over", None, "Diga a ele para vir.", "O H de him some: tel-im.")
add(F, CV, "[Is that] your dog?", "[I-zhat] your dog?", None, "Esse é o seu cachorro?", "O S de is passa para that: i-zhat.")
add(F, RD("Got to → Gotta"), "I've [got to] go soon", "I've [gotta] go soon", "I've gotta go soon", "Preciso ir logo.", "Got to vira gotta.")

# ---------- PRAIA (14) ----------
B = "Praia"
add(B, FL, "[Put on] some sunscreen", "[Pu-ton] some sunscreen", None, "Passe protetor solar.", "O T de put vira R e liga com on.")
add(B, RD("Going to → Gonna"), "I'm [going to] swim", "I'm [gonna] swim", "I'm gonna swim", "Vou nadar.", "Going to vira gonna.")
add(B, FL, "The [water] is cold", "The [wa-der] is cold", None, "A água está fria.", "O T entre vogais vira R: wa-der.")
add(B, CV, "[Look at] that wave!", "[Loo-kat] that wave!", None, "Olha aquela onda!", "O K de look passa para at: loo-kat.")
add(B, YL, "[Did you] bring a towel?", "[Di-dja] bring a towel?", None, "Você trouxe toalha?", "D + you soa como dj: di-dja.")
add(B, FL, "A [bottle of] water", "A [bo-dla] water", None, "Uma garrafa de água.", "O TT vira R e of encolhe: bo-dla.")
add(B, WK, "[Let's go for] a walk", "[Lets-go-fer] a walk", None, "Vamos dar uma caminhada.", "For fica fraco: fer.")
add(B, FL, "[Get in] the water", "[Ge-din] the water", None, "Entra na água.", "O T de get vira R: ge-din.")
add(B, YL, "[Don't you] want to swim?", "[Don-chu] want to swim?", None, "Você não quer nadar?", "T + you soa como ch: don-chu.")
add(B, RD("Want to → Wanna"), "I [want to] build a sandcastle", "I [wanna] build a sandcastle", "I wanna build a sandcastle", "Quero construir um castelo de areia.", "Want to vira wanna.")
add(B, FL, "It's [getting] late", "It's [ge-ding] late", None, "Está ficando tarde.", "O TT vira D rápido: ge-ding.")
add(B, CV, "[Pick up] your trash", "[Pi-kup] your trash", None, "Recolha seu lixo.", "O K de pick passa para up.")
add(B, HM, "[Give her] the umbrella", "[Giv-er] the umbrella", None, "Dê o guarda-sol a ela.", "O H de her some: giv-er.")
add(B, WK, "We're [out of] sunscreen", "We're [ou-dav] sunscreen", None, "Acabou o protetor solar.", "O T de out vira R e of encolhe: ou-dav.")

# ---------- BLITZ DA POLÍCIA (14) ----------
Z = "Blitz da polícia"
add(Z, CV, "Please [pull over]", "Please [pu-lover]", None, "Encoste, por favor.", "O L de pull passa para over.")
add(Z, YL, "[Do you] know why I [pulled you] over?", "[Da-ya] know why I [pul-dju] over?", None, "Você sabe por que o parei?", "Do you soa como da-ya e pulled you como pul-dju.")
add(Z, WK, "[License and] registration, please", "[Lai-sen-sn] registration, please", None, "Habilitação e documento do carro, por favor.", "And encolhe para n.")
add(Z, CV, "[Turn off] the engine", "[Tur-noff] the engine", None, "Desligue o motor.", "O N de turn passa para off.")
add(Z, FL, "[Put it in] park", "[Pu-di-din] park", None, "Coloque em P (estacionar).", "O T de put vira R e tudo se liga.")
add(Z, RD("Going to → Gonna"), "I'm [going to] reach for my wallet", "I'm [gonna] reach for my wallet", "I'm gonna reach for my wallet", "Vou pegar minha carteira.", "Going to vira gonna.")
add(Z, CV, "Can I [see your] insurance?", "Can I [see-yer] insurance?", None, "Posso ver seu seguro?", "See your se liga: see-yer.")
add(Z, WK, "[Where are you] headed?", "[Wherer-ya] headed?", None, "Para onde está indo?", "Are you encolhe para ya.")
add(Z, YL, "[Have you] been drinking?", "[Ha-vyu] been drinking?", None, "Você bebeu?", "Have you soa como ha-vyu.")
add(Z, FL, "[Get out] of the car", "[Ge-dout] of the car", None, "Saia do carro.", "O T de get vira R e liga com out.")
add(Z, WK, "[Keep your] hands on the wheel", "[Kee-pyer] hands on the wheel", None, "Mantenha as mãos no volante.", "Your fica fraco: yer.")
add(Z, RD("Don't know → Dunno"), "I [don't know] why", "I [dunno] why", "I dunno why", "Não sei por quê.", "Don't know vira dunno.")
add(Z, CV, "[Roll down] your window", "[Ro-ldown] your window", None, "Abaixe o vidro.", "O L de roll passa para down.")
add(Z, FL, "I'll [let it] go this time", "I'll [le-dit] go this time", None, "Vou deixar passar desta vez.", "O T de let vira R: le-dit.")

assert len(T) == 100, len(T)


def js(s):
    return json.dumps(s, ensure_ascii=False)


ORDER = ["Básicos", A, S, C, P, F, B, Z]
lines = []
for i, (cen, (cat, pad), o, r, f, pt, tip) in enumerate(T, 1):
    assert o.count("[") == r.count("["), (o, r)
    plain = re.sub(r"[\[\]]", "", o)
    fast = f or plain
    lines.append(
        "    { id: 'p%03d', cenario: %s, categoria: %s, padrao: %s,\n"
        "      original: %s, cotonete: %s, fast: %s,\n"
        "      pt: %s, tip: %s }" % (i, js(cen), js(cat), js(pad), js(o), js(r), js(fast), js(pt), js(tip)))

root = pathlib.Path(__file__).resolve().parent.parent
p = root / "js" / "data.js"
s = p.read_text(encoding="utf-8")
a = s.index("  /* Padrões de conexão por cenário")
b = s.index("  cotonete: [")
basicos = [
    ("p-cv", "Consoante + Vogal", "C + V", "[Turn off] the light", "[Tur-noff] the light", "Turn off the light", "Apague a luz.", "A consoante final de turn passa para a vogal de off: tur-noff."),
    ("p-flap", "Flap T", "T/D em som de R", "I gotta [open it] first", "I gotta [o-pe-nit] first", "I gotta open it first", "Preciso abrir primeiro.", "O T entre vogais vira um R rápido, e it gruda em open: o-pe-nit."),
    ("p-red", "Redução", "Want to → Wanna", "I [want to] go home", "I [wanna] go home", "I wanna go home", "Quero ir para casa.", "Want to encolhe para wanna na fala rápida do dia a dia."),
]
head = (
    "  /* Padrões de conexão por cenário (GERADO por tools/patterns_src.py: edite lá e rode o script).\n"
    "     `original` e `cotonete` usam [colchetes] nas partes ligadas; `fast` é o texto falado no modo \"Conectada\". */\n"
    "  cenarios: %s,\n  patterns: [\n" % json.dumps(ORDER, ensure_ascii=False))
bl = []
for (i, cat, pad, o, r, f, pt, tip) in basicos:
    bl.append("    { id: %s, cenario: 'Básicos', categoria: %s, padrao: %s,\n      original: %s, cotonete: %s, fast: %s,\n      pt: %s, tip: %s }" % (
        js(i), js(cat), js(pad), js(o), js(r), js(f), js(pt), js(tip)))
block = head + ",\n".join(bl + lines) + "\n  ],\n\n"
p.write_text(s[:a] + block + s[b:], encoding="utf-8")
print("ok:", len(T) + 3, "padrões em", p)
