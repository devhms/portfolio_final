import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "blast",
    title: "B.L.A.S.T.",
    fullTitle: "Batch Linked Automated Stock Tracker",
    status: "LIVE",
    stack: ["Python", "BeautifulSoup4", "pandas", "gspread", "Google Sheets API", "OAuth2"],
    tagline: "Multi-source PSX data ingestion → automatic Google Sheets sync",
    href: "/projects/blast",
  },
  {
    id: "dawn",
    title: "Dawn Scraper",
    status: "LIVE",
    stack: ["Python", "BeautifulSoup4", "requests", "dataclasses", "JSON"],
    tagline: "NLP-ready Dawn News articles as structured JSON — no post-processing needed",
    href: "/projects/dawn",
  },
  {
    id: "zuban",
    title: "Zuban",
    fullTitle: "زبان — Language Learning, Local-First",
    status: "IN PROGRESS",
    stack: ["Next.js 15", "TypeScript", "LangChain", "Ollama", "Tailwind CSS"],
    tagline: "On-device LLM inference for language learning — zero API cost, privacy-first",
    href: "/projects/zuban",
  },
  {
    id: "capital",
    title: "Capital Suite",
    status: "COMPLETE",
    stack: ["Java", "OOP", "Inheritance", "Command Pattern", "Serialization"],
    tagline: "Banking simulation showcasing OOP patterns: inheritance, command, encapsulation",
    href: "/projects/capital",
  },
];

export const blastCode = `# blast.py — Batch Linked Automated Stock Tracker
# PSX multi-source ingestion → Google Sheets sync

from dataclasses import dataclass
from bs4 import BeautifulSoup
import pandas as pd
import gspread, requests
from google.oauth2.service_account import Credentials

SCOPES = ["https://spreadsheets.google.com/feeds",
          "https://www.googleapis.com/auth/drive"]

@dataclass
class StockRow:
    symbol: str
    price: float
    change: float
    volume: int

def fetch(url: str) -> BeautifulSoup:
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")

def parse(soup: BeautifulSoup) -> list[StockRow]:
    rows = []
    for tr in soup.select("table.stocks tbody tr"):
        tds = tr.find_all("td")
        if len(tds) < 4:
            continue
        rows.append(StockRow(
            symbol=tds[0].text.strip(),
            price=float(tds[1].text.replace(",", "")),
            change=float(tds[2].text.replace(",", "")),
            volume=int(tds[3].text.replace(",", "")),
        ))
    return rows

def transform(rows: list[StockRow]) -> pd.DataFrame:
    df = pd.DataFrame([r.__dict__ for r in rows])
    df["change_pct"] = (df["change"] / df["price"] * 100).round(2)
    return df.sort_values("symbol")

def sync_to_sheets(df: pd.DataFrame, sheet_id: str) -> None:
    creds = Credentials.from_service_account_file(
        "sa.json", scopes=SCOPES
    )
    gc = gspread.authorize(creds)
    ws = gc.open_by_key(sheet_id).sheet1
    ws.clear()
    ws.update([df.columns.tolist()] + df.values.tolist())

if __name__ == "__main__":
    soup = fetch("https://psx.com.pk/market-summary")
    rows = parse(soup)
    df   = transform(rows)
    sync_to_sheets(df, sheet_id="YOUR_SHEET_ID")
    print(f"✓ Synced {len(df)} rows to Sheets")`;

export const dawnCode = `# dawn_scraper.py — Dawn News → structured JSON
# Zero post-processing needed for NLP pipelines

from dataclasses import dataclass, asdict
from bs4 import BeautifulSoup
import requests, json, re
from datetime import datetime

@dataclass
class Article:
    title: str
    body: str
    author: str
    date: str
    category: str
    url: str
    word_count: int

BASE_URL = "https://www.dawn.com"

def scrape_article(url: str) -> Article:
    soup = BeautifulSoup(requests.get(url, timeout=10).text, "html.parser")

    title  = soup.select_one("h1.story__title").text.strip()
    author = (soup.select_one(".story__byline a") or
              soup.select_one(".story__author")).text.strip()
    date   = soup.select_one("time")["datetime"]
    cat    = soup.select_one(".story__category").text.strip()
    paras  = soup.select("div.story__content p")
    body   = " ".join(p.text.strip() for p in paras)

    return Article(
        title=title, body=body, author=author,
        date=date, category=cat, url=url,
        word_count=len(body.split())
    )

def scrape_section(section: str, limit: int = 20) -> list[Article]:
    index = BeautifulSoup(
        requests.get(f"{BASE_URL}/{section}/", timeout=10).text, "html.parser"
    )
    links = [
        a["href"] for a in index.select("article.story a.story__link")
        if a.get("href", "").startswith("https")
    ][:limit]
    return [scrape_article(url) for url in links]

if __name__ == "__main__":
    articles = scrape_section("pakistan", limit=20)
    with open("dawn_pakistan.json", "w", encoding="utf-8") as f:
        json.dump([asdict(a) for a in articles], f, ensure_ascii=False, indent=2)
    print(f"✓ Scraped {len(articles)} articles")`;

export const zubanCode = `// zuban/app/api/chat/route.ts
// Local Ollama inference — zero cloud API cost

import { NextRequest, NextResponse } from "next/server";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const SYSTEM = \`You are Zuban, an adaptive Urdu language tutor.
Assess the learner's level from their input.
Respond in a mix of Urdu (in Roman script) and English.
Keep explanations short. Correct gently. Encourage always.\`;

export async function POST(req: NextRequest) {
  const { message, history } = await req.json() as {
    message: string;
    history: { role: "user" | "assistant"; content: string }[];
  };

  const model = new ChatOllama({
    model: "llama3.2",
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    temperature: 0.7,
  });

  const msgs = [
    new SystemMessage(SYSTEM),
    ...history.map(h =>
      h.role === "user"
        ? new HumanMessage(h.content)
        : new SystemMessage(h.content)
    ),
    new HumanMessage(message),
  ];

  const response = await model.invoke(msgs);

  return NextResponse.json({ reply: response.content });
}`;

export const capitalCode = `// BankingSystem.java — Capital Suite
// OOP patterns: Inheritance, Command, Encapsulation, Serialization

import java.io.*;
import java.util.*;

// ── Account hierarchy (Inheritance) ──────────────────────────────
abstract class Account implements Serializable {
    private final String id;
    private final String holder;
    protected double balance;

    Account(String id, String holder, double initial) {
        this.id = id; this.holder = holder; this.balance = initial;
    }

    abstract double interestRate();

    void applyInterest() { balance += balance * interestRate(); }

    String getId()     { return id; }
    String getHolder() { return holder; }
    double getBalance(){ return balance; }

    @Override public String toString() {
        return String.format("[%s] %s — $%.2f", id, holder, balance);
    }
}

class SavingsAccount extends Account {
    SavingsAccount(String id, String holder, double b) { super(id, holder, b); }
    @Override public double interestRate() { return 0.04; }
}

class CurrentAccount extends Account {
    CurrentAccount(String id, String holder, double b) { super(id, holder, b); }
    @Override public double interestRate() { return 0.01; }
}

// ── Command pattern (Transactions) ────────────────────────────────
interface Command { void execute(); void undo(); }

record DepositCmd(Account acc, double amt) implements Command {
    public void execute() { acc.balance += amt; }
    public void undo()    { acc.balance -= amt; }
}

record WithdrawCmd(Account acc, double amt) implements Command {
    public void execute() {
        if (acc.balance < amt) throw new IllegalStateException("Insufficient funds");
        acc.balance -= amt;
    }
    public void undo() { acc.balance += amt; }
}

// ── Bank (Encapsulation + Persistence) ────────────────────────────
class Bank {
    private final Map<String, Account> accounts = new LinkedHashMap<>();
    private final Deque<Command> history = new ArrayDeque<>();
    private static final String FILE = "bank.dat";

    void addAccount(Account a) { accounts.put(a.getId(), a); }

    void run(Command cmd) {
        cmd.execute();
        history.push(cmd);
    }

    void undoLast() {
        if (!history.isEmpty()) history.pop().undo();
    }

    @SuppressWarnings("unchecked")
    void load() throws IOException, ClassNotFoundException {
        try (var ois = new ObjectInputStream(new FileInputStream(FILE))) {
            accounts.putAll((Map<String, Account>) ois.readObject());
        }
    }

    void save() throws IOException {
        try (var oos = new ObjectOutputStream(new FileOutputStream(FILE))) {
            oos.writeObject(accounts);
        }
    }

    void printAll() { accounts.values().forEach(System.out::println); }
}`;
