// UnloadingDetailScreen.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

/** Types */
type PalletItem = {
  id: string;
  palletNo: string;
  qtyScan: string;
};

type SKUItem = {
  id: string;
  skuNumber: string;
  uom: string;
  qtyPlan: string;
  outstanding: string;
  kodeProduksi: string;
  attachment: string;
  pallets: PalletItem[];
};

type FormValues = {
  skus: SKUItem[];
};

/** helper factory */
const makeNewSku = (): SKUItem => ({
  id: uuidv4(),
  skuNumber: "",
  uom: "",
  qtyPlan: "900",
  outstanding: "900",
  kodeProduksi: "",
  attachment: "LoremIpsum.jpg",
  pallets: [{ id: uuidv4(), palletNo: "", qtyScan: "" }],
});

/** Parent screen */
export default function UnloadingDetailScreen() {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { skus: [makeNewSku()] },
  });

  // field array for SKUs (called once at parent)
  const { fields: skus, append: appendSku, remove: removeSku } = useFieldArray({
    control,
    name: "skus",
    keyName: "formSkuId", // safe extra key name
  });

  const onSubmit = (data: FormValues) => {
    console.log("SUBMIT:", JSON.stringify(data, null, 2));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* header (optional) */}
      <View style={styles.headerCard}>
        <Text style={styles.headerSmall}>Inbound Planning ID</Text>
        <Text style={styles.headerId}>CWH02-IN-0625-0002</Text>
      </View>

      {/* render cards — each card is a child component */}
      {skus.map((skuField, index) => (
        <SKUCard
          key={skuField.id}
          control={control}
          cardIndex={index}
          removeSku={removeSku}
          totalSkus={skus.length}
        />
      ))}

      {/* Add More SKU */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => appendSku(makeNewSku())}
      >
        <Text style={styles.addButtonText}>＋ Add More SKU</Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: "#16a34a", marginTop: 12 }]}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.addButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/** Child component: single SKU card */
function SKUCard({
  control,
  cardIndex,
  removeSku,
  totalSkus,
}: {
  control: any;
  cardIndex: number;
  removeSku: (index: number) => void;
  totalSkus: number;
}) {
  // *** IMPORTANT: useFieldArray for pallets is inside this child component ***
  const {
    fields: palletFields,
    append: appendPallet,
    remove: removePallet,
  } = useFieldArray({
    control,
    name: `skus.${cardIndex}.pallets`,
    keyName: "formPalletId",
  });

  return (
    <View style={styles.card}>
      {/* header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Inbound Detail</Text>

        {/* delete card (only if > 1 card) */}
        <TouchableOpacity
          onPress={() => totalSkus > 1 && removeSku(cardIndex)}
          disabled={totalSkus <= 1}
          style={[styles.deleteBtn, totalSkus <= 1 && { opacity: 0.5 }]}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* SKU Number */}
      <Text style={styles.label}>SKU Number</Text>
      <Controller
        control={control}
        name={`skus.${cardIndex}.skuNumber`}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Select / type SKU"
            style={styles.input}
          />
        )}
      />

      {/* UoM */}
      <Text style={styles.label}>UoM</Text>
      <Controller
        control={control}
        name={`skus.${cardIndex}.uom`}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="UoM"
            style={styles.input}
          />
        )}
      />

      {/* Qty Plan & Outstanding */}
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Text style={styles.label}>Qty Plan</Text>
          <Controller
            control={control}
            name={`skus.${cardIndex}.qtyPlan`}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="0"
                style={styles.input}
              />
            )}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={styles.label}>Outstanding</Text>
          <Controller
            control={control}
            name={`skus.${cardIndex}.outstanding`}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="0"
                style={styles.input}
              />
            )}
          />
        </View>
      </View>

      {/* Pallets (dynamic rows) */}
      <Text style={[styles.label, { marginTop: 8 }]}>Pallets</Text>

      {palletFields.map((pallet, palletIndex) => (
        <View key={pallet.formPalletId} style={[styles.row, { alignItems: "flex-end" }]}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Controller
              control={control}
              name={`skus.${cardIndex}.pallets.${palletIndex}.palletNo`}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Pallet No."
                  style={styles.input}
                />
              )}
            />
          </View>

          <View style={{ width: 110, marginLeft: 6 }}>
            <Controller
              control={control}
              name={`skus.${cardIndex}.pallets.${palletIndex}.qtyScan`}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Qty Scan"
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
          </View>

          {/* minus button (only shown if >1) */}
          {palletFields.length > 1 && (
            <TouchableOpacity
              onPress={() => removePallet(palletIndex)}
              style={styles.minusButton}
            >
              <Text style={styles.minusText}>−</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* + add pallet (always available) */}
      <TouchableOpacity
        style={styles.smallAddButton}
        onPress={() => appendPallet({ id: uuidv4(), palletNo: "", qtyScan: "" })}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      {/* Kode Produksi */}
      <Text style={styles.label}>Kode Produksi</Text>
      <Controller
        control={control}
        name={`skus.${cardIndex}.kodeProduksi`}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Kode Produksi"
            style={styles.input}
          />
        )}
      />

      {/* Attachment */}
      <Text style={styles.label}>Attachment</Text>
      <Controller
        control={control}
        name={`skus.${cardIndex}.attachment`}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Attachment filename"
            style={styles.input}
          />
        )}
      />
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },

  headerCard: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  headerSmall: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  headerId: { fontSize: 18, fontWeight: "700", color: "#1e293b", letterSpacing: 0.5 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },

  label: { fontSize: 13, color: "#334155", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#f1f5f9",
    borderWidth: 0,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 15,
    color: "#1e293b",
  },

  row: { flexDirection: "row", alignItems: "center" },

  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },
  deleteText: { color: "#ef4444", fontWeight: "700", fontSize: 14 },

  smallAddButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
    shadowColor: "#2563eb",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  addButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#2563eb",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  minusButton: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  minusText: { color: "#ef4444", fontSize: 20, fontWeight: "700" },

  addButtonTextSmall: { color: "#fff", fontWeight: "700" },
  minusTextSmall: { color: "#fff", fontWeight: "700" },

  smallAddButtonText: { color: "#fff", fontWeight: "700" },
});
