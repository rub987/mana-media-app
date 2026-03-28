import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { clients } = await request.json();
  const supabase = await createClient();
  let imported = 0;

  for (const client of clients) {
    // Vérifier si le client existe déjà (par nom)
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("nom", client.nom)
      .single();

    if (!existing) {
      const mots = client.nom.trim().split(" ");
      const initiales = mots.length >= 2
        ? (mots[0][0] + mots[1][0]).toUpperCase()
        : client.nom.substring(0, 2).toUpperCase();

      await supabase.from("clients").insert({
        nom: client.nom,
        secteur: client.secteur,
        offre: client.offre || null,
        budget_mensuel: client.budget_mensuel || 0,
        statut: client.statut || "Active",
        canaux: client.canaux || [],
        roi: client.roi || "—",
        contrat: "12 mois",
        initiales,
        progression: 0,
        zoho_id: client.zoho_id || null,
      });
      imported++;
    } else if (client.zoho_id) {
      // Mettre à jour le zoho_id si manquant
      await supabase.from("clients").update({ zoho_id: client.zoho_id }).eq("id", existing.id).is("zoho_id", null);
    }
  }

  return NextResponse.json({ imported });
}
